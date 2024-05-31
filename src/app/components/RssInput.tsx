'use client';

import {useState} from 'react';
import styles from './RssInput.module.css';

const RssInput = () => {
  const [state, setState] = useState('');

  return (
    <input
      className={styles.urlInput}
      name="url"
      type="text"
      value={state}
      onChange={event => setState(event?.currentTarget.value ?? '')}
      placeholder="https://feeds.audiomeans.fr/feed/d7c6111b-04c1-46bc-b74c-d941a90d37fb.xml"
    />
  );
};

export {RssInput};
