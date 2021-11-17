
// import react
import { TextField } from '@dashup/ui';
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
  const [distFolder, setDistFolder] = useState(props.page.get('data.dist') || '');

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
        <TextField
          label="Git Repo"
          value={ `https://${git}/${props.page.get('_id')}.git` }
          fullWidth

          InputProps={ {
            readOnly : true,
          } }
        />
      ) }
      { !!key && (
        <TextField
          label="Git Password"
          value={ key }
          fullWidth

          InputProps={ {
            readOnly : true,
          } }
        />
      ) }
      { !!host && (
        <TextField
          label="Host Domain"
          value={ `https://${props.page.get('_id')}.${host}` }
          fullWidth

          InputProps={ {
            readOnly : true,
          } }
        />
      ) }

      <TextField
        label="Host Domain"
        value={ distFolder }
        fullWidth
        onChange={ (e) => !setDistFolder(e.target.value) && debounce(props.setData, 100)('dist', e.target.value) }
      />
    </>
  );
};

// export default
export default PageHostConfig;