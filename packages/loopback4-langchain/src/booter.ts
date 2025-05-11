import {BaseArtifactBooter, booter} from '@loopback/boot';
import {Application, config, inject, CoreBindings} from '@loopback/core';
import {BootBindings} from '@loopback/boot';
import path from 'path';
import * as fs from 'fs';
import {RUNNABLE_LOADER} from './keys';
import {RunnableLoader, Runnable} from './runtime/runnable-loader';
import * as yaml from 'yaml';

/**
 * Default options for LangChainBooter
 */
export const LangChainBooterDefaults = {
  // Directories to scan for artifacts
  prompts: {
    dirs: ['prompts'],
    extensions: ['.js', '.json', '.ts'],
    nested: true,
  },
  tools: {
    dirs: ['tools'],
    extensions: ['.js', '.ts'],
    nested: true,
  },
  retrievers: {
    dirs: ['retrievers'],
    extensions: ['.js', '.ts'],
    nested: true,
  },
  chains: {
    dirs: ['chains'],
    extensions: ['.js', '.ts'],
    nested: true,
  },
  systems: {
    dirs: ['systems'],
    extensions: ['.js', '.ts'],
    nested: true,
  },
  runnables: {
    dirs: ['.'],
    extensions: ['.runnable.json', '.runnable.yaml'],
    nested: true,
  },
};

/**
 * A class that extends BaseArtifactBooter to boot LangChain artifacts.
 * Scans directories for prompts, tools, retrievers, chains, and systems.
 *
 * Supported phases: configure, discover, load
 */
@booter('langchain')
export class LangChainBooter extends BaseArtifactBooter {
  private app: Application;
  private promptsDiscovered: string[] = [];
  private toolsDiscovered: string[] = [];
  private retrieversDiscovered: string[] = [];
  private chainsDiscovered: string[] = [];
  private systemsDiscovered: string[] = [];
  private runnablesDiscovered: string[] = [];

  // Define options as a property with the expected structure
  public options: {
    dirs: string[];
    extensions: string[];
    nested: boolean;
  };

  constructor(
    @inject('application.instance') app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public artifactOptions: typeof LangChainBooterDefaults = LangChainBooterDefaults,
  ) {
    // Create options object for super() call
    const bootOptions = {
      dirs: [],
      extensions: [],
      nested: true,
    };

    super(projectRoot, bootOptions);

    // Initialize the options property
    this.options = bootOptions;
    this.app = app;
  }

  /**
   * Override the artifactName getter to return a custom name
   */
  get artifactName(): string {
    return 'LangChain';
  }

  /**
   * Configure the booter by setting up the glob patterns for each artifact type
   */
  async configure() {
    // We'll handle the configuration for each artifact type separately
    // so we don't need to call super.configure()
  }

  /**
   * Discover files for each artifact type
   */
  async discover() {
    // Discover prompts
    const promptsGlob = this.buildGlob(this.artifactOptions.prompts);
    this.promptsDiscovered = await this.discoverWithGlob(promptsGlob);

    // Discover tools
    const toolsGlob = this.buildGlob(this.artifactOptions.tools);
    this.toolsDiscovered = await this.discoverWithGlob(toolsGlob);

    // Discover retrievers
    const retrieversGlob = this.buildGlob(this.artifactOptions.retrievers);
    this.retrieversDiscovered = await this.discoverWithGlob(retrieversGlob);

    // Discover chains
    const chainsGlob = this.buildGlob(this.artifactOptions.chains);
    this.chainsDiscovered = await this.discoverWithGlob(chainsGlob);

    // Discover systems
    const systemsGlob = this.buildGlob(this.artifactOptions.systems);
    this.systemsDiscovered = await this.discoverWithGlob(systemsGlob);

    // Discover runnables
    const runnablesGlob = this.buildGlob(this.artifactOptions.runnables);
    this.runnablesDiscovered = await this.discoverWithGlob(runnablesGlob);
  }

  /**
   * Load the discovered artifacts and bind them to the application
   */
  async load() {
    // Load and bind prompts
    const promptClasses = await this.loadClassesFromFiles(
      this.promptsDiscovered,
    );
    this.bindArtifacts('prompts', promptClasses);

    // Load and bind tools
    const toolClasses = await this.loadClassesFromFiles(this.toolsDiscovered);
    this.bindArtifacts('tools', toolClasses);

    // Load and bind retrievers
    const retrieverClasses = await this.loadClassesFromFiles(
      this.retrieversDiscovered,
    );
    this.bindArtifacts('retrievers', retrieverClasses);

    // Load and bind chains
    const chainClasses = await this.loadClassesFromFiles(this.chainsDiscovered);
    this.bindArtifacts('chains', chainClasses);

    // Load and bind systems
    const systemClasses = await this.loadClassesFromFiles(
      this.systemsDiscovered,
    );
    this.bindArtifacts('systems', systemClasses);

    // Load and bind runnables
    await this.loadAndBindRunnables(this.runnablesDiscovered);
  }

  /**
   * Load and bind runnable files
   * @param files Array of runnable file paths
   */
  private async loadAndBindRunnables(files: string[]) {
    if (!files.length) return;

    // Get the RunnableLoader from the application
    const runnableLoader = await this.app.get(RUNNABLE_LOADER);

    for (const file of files) {
      try {
        // Read the file content
        const content = fs.readFileSync(file, 'utf-8');

        // Parse the content based on file extension
        let spec: Runnable;
        if (file.endsWith('.runnable.json')) {
          spec = JSON.parse(content);
        } else if (file.endsWith('.runnable.yaml')) {
          spec = yaml.parse(content);
        } else {
          // Skip files with unsupported extensions
          continue;
        }

        // Load the runnable using the RunnableLoader
        const runnable = await runnableLoader.load({spec});

        // Bind the runnable to the application
        const binding = this.app
          .bind(`langchain.runnable.${runnable.id}`)
          .to(runnable);

        // Add metadata to the binding
        binding.tag({
          artifactType: 'runnable',
          name: runnable.name,
          type: runnable.type,
        });

        console.log(`Bound runnable ${runnable.id} from ${file}`);
      } catch (error) {
        // Log the error but continue with other files
        console.error(`Error loading runnable from ${file}:`, error);
      }
    }
  }

  /**
   * Build a glob pattern for the given artifact options
   */
  private buildGlob(artifactOptions: {
    dirs: string[];
    extensions: string[];
    nested: boolean;
  }): string {
    const {dirs, extensions, nested} = artifactOptions;

    let joinedDirs = dirs.join(',');
    if (dirs.length > 1) {
      joinedDirs = `{${joinedDirs}}`;
    }

    const joinedExts =
      extensions.length > 0 ? `@(${extensions.join('|')})` : '';

    return `/${joinedDirs}/${nested ? '**/*' : '*'}${joinedExts}`;
  }

  /**
   * Discover files using the given glob pattern
   */
  private async discoverWithGlob(glob: string): Promise<string[]> {
    const {discoverFiles} = require('@loopback/boot/dist/booters/booter-utils');
    return discoverFiles(glob, this.projectRoot);
  }

  /**
   * Load classes from the given files
   */
  private async loadClassesFromFiles(files: string[]): Promise<object[]> {
    const {
      loadClassesFromFiles,
    } = require('@loopback/boot/dist/booters/booter-utils');
    return loadClassesFromFiles(files, this.projectRoot);
  }

  /**
   * Bind the discovered artifacts to the application
   */
  private bindArtifacts(type: string, artifacts: object[]) {
    artifacts.forEach((artifact, index) => {
      const binding = this.app.bind(`langchain.${type}.${index}`).to(artifact);

      // Add metadata to the binding
      binding.tag({
        artifactType: type,
        name: artifact.constructor.name,
      });
    });
  }
}
