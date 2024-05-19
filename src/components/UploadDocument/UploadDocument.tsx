import { Button, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const DocumentUploader = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setSelectedFile(file); // Set the selected file
    setFileName(file.name); // Update the file name state
    onFileSelect(file); // Notify the parent component
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    onDrop,
  });

  return (
    <div style={{width:'100%'}} >
      <div {...getRootProps()} >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography variant='h6'>Drop the files here ...</Typography>
        ) : (
          <Typography variant='body1'>Drag 'n' drop some files here, or use the button to select files</Typography>
        )}
        <Button variant='contained' sx={{marginTop:2}} onClick={open}>Select Files</Button>
        {selectedFile && (
          <div>
            <p>Selected file: {fileName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
