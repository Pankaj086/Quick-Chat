export const uploadFile = async (file, onProgress) => {
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'chat_images/');  // Specify folder if needed

    const xhr = new XMLHttpRequest();

    // Event listener to track upload progress
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress); // Update progress
        }
    });

    return new Promise((resolve, reject) => {
        xhr.open('POST', CLOUDINARY_URL, true);

        // Handle successful upload
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.secure_url); // Return the secure URL of the uploaded image
            } else {
                reject('Failed to upload image');
            }
        };

        // Handle upload error
        xhr.onerror = () => reject('Failed to upload image');

        // Send the form data
        xhr.send(formData);
    });
};
