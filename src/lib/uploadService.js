import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadRecipeImage = (file, userId, recipeId, onProgress) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("no file provided");
            return;
        }

        const timestamp = new Date().getTime();
        const fileName = `${timestamp}_${file.name}`;

        const storageRef = ref(storage, `recipes/${userId}/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                })
                .catch(reject);
            }
        );
    });
};