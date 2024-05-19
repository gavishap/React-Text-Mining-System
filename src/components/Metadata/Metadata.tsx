import { Box, Button, CircularProgress, TextField, Typography, styled } from '@mui/material';
import React, { useState, ChangeEvent, FormEvent } from 'react';

interface Props {
  onSubmit: (metadata: { name: string, author: string, date: string }) => void;
}

interface Metadata {
  name: string;
  author: string;
  date: string; // or Date if you're using a Date object
}

const FileMetadataForm = ({ onSubmit, loading }: { onSubmit: (metadata: Metadata) => Promise<void>, loading: boolean }) => {

  const TextInput = styled(TextField)({
    width: '100%',
    marginBottom: 8
  })

  const [metadata, setMetadata] = useState({
    name: '',
    author: '',
    date: ''
  });


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(metadata);
  };

  const inputStyle = {
    width: '100%',
    marginBottom: 8,
    height: 40
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {loading ? (
        <Box width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <CircularProgress />
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <>
          <div className="form-field">
            <label htmlFor="name">File Name:</label>
            <input name='name' value={metadata.name} onChange={handleChange} style={inputStyle} />
          </div>
          <div className="form-field">
            <label htmlFor="author">writter:</label>
            <input type="text" name="author" value={metadata.author} onChange={handleChange} style={inputStyle} />
          </div>
          <div className="form-field">
            <label htmlFor="date">Date:</label>
            <input type="date" name="date" value={metadata.date} onChange={handleChange} style={inputStyle} />
          </div>
          <Button variant='contained' type="submit">Add Document</Button>
        </>
      )}

    </form>
  );

};

export default FileMetadataForm;
