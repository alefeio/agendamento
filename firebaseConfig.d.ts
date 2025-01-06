declare module './firebaseConfig' {
    import { FirebaseApp } from 'firebase/app';
    import { Firestore } from 'firebase/firestore';

    export const app: FirebaseApp;
    export const db: Firestore;
}
