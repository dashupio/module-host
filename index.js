// require first
const cp = require('child_process');
const Server = require('node-git-server');
const recursive = require('recursive-readdir');
const Bottleneck = require('bottleneck');
const { Storage } = require('@google-cloud/storage');
const { Module, Query } = require('@dashup/module');

// import base
const HostPage = require('./pages/host');

/**
 * export module
 */
class HostModule extends Module {

  /**
   * construct discord module
   */
  constructor() {
    // run super
    super();

    // bind methods
    this.start = this.start.bind(this);
    this.storage = this.storage.bind(this);

    // create limiter
    this.limiter = new Bottleneck({
      maxConcurrent : 25,
    });

    // run host
    this.building.then(this.start);
  }
  
  /**
   * registers dashup structs
   *
   * @param {*} register 
   */
  register(fn) {
    // register sms action
    fn('page', HostPage);
  }

  /**
   * storage
   */
  async storage() {
    // Create store
    this.store = this.store || new Storage({
      credentials : this.config.google,
    });

    // Get bucket
    this.bucket = this.bucket || new Promise(async (res) => {
      try {
        // Run try/catch
        await this.store.createBucket(this.config.bucket);
      } catch (e) { /* eh */ }

      // Resolve
      res();
    });

    // return bucket
    return this.bucket;
  }

  /**
   * starts git
   */
  async start() {
    // create limiter
    this.limiter = new Bottleneck({
      maxConcurrent : 25,
    });

    // create git server
    const repos = new Server(this.config.dir, {
      autoCreate   : true,
      authenticate : ({ type, repo, user }, next) => {
        // check authenticate
        if (type == 'push') {
          // run user
          user(async (email, key) => {
            // repo
            const actualKey = await this.dashup.connection.rpc({
              type   : 'page',
              page   : repo.replace('.git', ''),
              struct : 'host',
            }, 'page.key', repo.replace('.git', ''));

            // check key
            if (key !== actualKey) {
              // return invalid
              return next('Invalid credentials');
            }

            // next
            next();
          });
        } else {
          next();
        }
      }
    });

    // SETUP GIT

    // set git port
    const gitPort = parseInt(this.config.port, 10);
    
    // on push
    repos.on('push', async (push) => {
      // push log
      push.log('checking repo...');

      // log
      push.log('successfully checked repo');

      // accept
      push.accept();

      // on end
      push.on('close', () => this.pushAction(push));
    });
    
    // on fetch
    repos.on('fetch', (fetch) => {
      // decline
      fetch.decline();
    });
    
    // on listen
    repos.listen(gitPort, () => {
      // log
      console.log(`node-git-server running at http://localhost:${gitPort}`);
    });
  }

  /**
   * push all files to b2
   *
   * @param push 
   */
  async pushAction(push) {
    // cloning files
    console.log(`cloning files from ${push.repo}:${push.commit} on ${push.branch}...`);

    // repo
    push.repo = push.repo.replace('.git', '');

    // get repo
    const page = await new Query(this.dashup, 'page', {
      type   : 'page',
      page   : repo.replace('.git', ''),
      struct : 'host',
    }).findById(push.repo);

    // exec clone
    await fs.ensureDir(`${this.config.dir}/${push.repo}`);

    // exec base and checkout
    await new Promise((resolve) => {
      // exec
      cp.exec(`git --git-dir=${this.config.dir}/${push.repo}.git --work-tree=${this.config.dir}/${push.repo} checkout ${push.branch} -f`, (err) => {
        // resolve
        resolve();
      });
    });

    // successfully cloned files
    console.log(`successfully cloned files from ${push.commit} on ${push.branch}`);

    // get push path
    let path = page.get('data.dist') || 'public';

    // add slash
    if (path.length && path.split('').shift() !== '/') path = `/${path}`;

    // successfully cloned files
    console.log(`uploading files to google`);

    // sync folder
    await this.storage();

    // remote local
    const local = `${this.config.dir}/${push.repo}${path}`;
    const remote = `git/${push.repo}`;

    // push all files to b2
    const files = await new Promise((resolve, reject) => {
      // read recursively
      recursive(local, (err, files) => {
        // reject
        if (err) return reject(err);
  
        // resolve
        resolve(files);
      });
    });

    // create push
    await Promise.all(files.map((file) => this.limiter.schedule(async () => {
      // Create upload
      await this.store
        .bucket(this.bucket)
        .upload(file, {
          gzip        : true,
          destination : `${remote}${file.replace(local, '')}`,
        });
    })));

    // successfully cloned files
    console.log(`successfully uploaded files to google`);

    // successfully cloned files
    console.log(`removing local folders`);

    // remove folders
    await fs.remove(`${this.config.dir}/${push.repo}`);
    await fs.remove(`${this.config.dir}/${push.repo}.git`);

    // successfully cloned files
    console.log(`successfully removed local folders`);
  }
}

// create new
module.exports = new HostModule();
