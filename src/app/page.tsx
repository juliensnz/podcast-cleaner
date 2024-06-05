import {Suspense} from 'react';
import styles from './page.module.css';
import {RssInput} from '@/app/components/RssInput';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <Suspense>
          <RssInput />
        </Suspense>
      </div>
    </main>
  );
}
