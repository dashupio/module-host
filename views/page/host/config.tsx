
// import react
import React, { useState, useEffect } from 'react';

// global timer
let timer;

// global debounce
const debounce = (func, timeout = 1000) => {

  // return debounced
  return (...args) => {
    // clear timeout previously
    clearTimeout(timer);

    // create new timeout
    timer = setTimeout(() => func(...args), timeout);
  };
}

// page host config
const PageHostConfig = (props = {}) => {
  // setate
  const [key, setKey] = useState(null);
  const [git, setGit] = useState(null);
  const [host, setHost] = useState(null);

  // use effect
  useEffect(() => {
    // load data
    props.page.action('host', props.page.get('_id')).then((opts) => {
      // set info
      setKey(opts.key);
      setGit(opts.git);
      setHost(opts.host);
    });
  }, [props.page && props.page.get('_id')]);

  // return jsx
  return (
    <>
      { !!git && (
        <div class="mb-3">
          <label class="form-label">
            Git Repo
          </label>
          <div class="mb-3">
            <input class="form-control" readOnly value={ `https://${git}/${props.page.get('_id')}.git` } />
          </div>
        </div>
      ) }
      { !!key && (
        <div class="mb-3">
          <label class="form-label">
            Git Password
          </label>
          <input class="form-control" readOnly value={ key } />
        </div>
      ) }
      { !!host && (
        <div class="mb-3">
          <label class="form-label">
            Host Domain
          </label>
          <input class="form-control" readOnly value={ `https://${props.page.get('_id')}.${host}` } />
        </div>
      ) }

      <div class="m-0">
        <label for="dist" class="form-label">
          Distribution Folder
        </label>
        <input class="form-control" onChange={ (e) => debounce(props.setData, 100)('dist', e.target.value) } type="text" defaultValue={ props.page.get('data.dist') || '' } />
      </div>
    </>
  );
};

// export default
export default PageHostConfig;