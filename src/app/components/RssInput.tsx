'use client';

import {generateRssAction} from '@/app/lib/GenerateRssAction';
import {useActionState} from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Input = styled.input`
  width: 80vw;
  max-width: 800px;
  height: 50px;
  display: inline-block;
  padding: 0 20px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-radius: 25px;
`;

const SubmitButton = styled.button`
  height: 50px;
  padding: 0 20px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-radius: 25px;
`;

const RssInput = () => {
  let [state, formAction, loading] = useActionState(generateRssAction, {url: '', error: null, feedUrl: null});

  return (
    <Container>
      <Form action={formAction}>
        <Field>
          <Input
            name="url"
            type="text"
            placeholder="https://feeds.audiomeans.fr/feed/d7c6111b-04c1-46bc-b74c-d941a90d37fb.xml"
            defaultValue={state.url}
          />
          {state.error && <div>{state.error.message}</div>}
        </Field>
        <SubmitButton type="submit">{loading ? 'Loading...' : 'Clean!'}</SubmitButton>
      </Form>
      {state.feedUrl && <a href={`podcast://podcast-cleaner.vercel.app/api/clean?url=${state.feedUrl}`}>Follow feed</a>}
    </Container>
  );
};

export {RssInput};
