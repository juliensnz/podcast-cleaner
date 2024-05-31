'use client';

import {generateRssAction} from '@/app/lib/GenerateRssAction';
import {useActionState} from 'react';

const RssInput = () => {
  const [state, action] = useActionState(generateRssAction, '');

  return (
    <form action={action}>
      <input name="url" type="text" />
      <div>{state as string}</div>
    </form>
  );
};

export {RssInput};
