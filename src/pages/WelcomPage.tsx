// src/pages/HomePage.tsx
import { Box, Card, Stack, Typography, styled, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import UploadDocument from '../components/UploadDocument/UploadModal';
import { useState } from 'react';

function HomePage() {

  const LinkButton = styled(Card)({
    width: 300,
    height: 60,
    fontWeight: 'bold',
    border: '1px solid lightgray',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  })

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  return (
    <Stack direction={'column'} justifyContent={'center'} alignItems={'center'} gap={4}>
      <Typography variant='h3' fontWeight={'bold'} m={3}>Concordance Application</Typography>

      <Stack direction={smallScreen ? 'column' : 'row'} gap={4} width={'55%'} justifyContent={smallScreen ? 'center' : 'space-between'} alignItems={'center'}>
        <Box style={{ textDecoration: 'none', color: 'black', fontSize: 20 }}><LinkButton sx={{ cursor: 'pointer' }} onClick={handleOpen}>
          <Icon width={24} icon="icon-park:inbox-upload-r" />
          <Typography variant='h6' ml={2} fontWeight={'bold'} >Upload Documents</Typography>
        </LinkButton></Box>
        <Link to="/words-display" style={{ textDecoration: 'none', color: 'black', fontSize: 20 }}><LinkButton >
          <Icon width={24} icon="icon-park:display" />
          <Typography variant='h6' ml={2} fontWeight={'bold'} >Display Words</Typography>
        </LinkButton>
        </Link>
      </Stack>
      <Stack direction={smallScreen ? 'column' : 'row'} gap={4} width={'55%'} justifyContent={smallScreen ? 'center' : 'space-between'} alignItems={'center'}>
        <Link to="/words-group" style={{ textDecoration: 'none', color: 'black', fontSize: 20 }}><LinkButton >
          <Icon width={24} icon="noto-v1:input-latin-letters" />
          <Typography variant='h6' ml={2} fontWeight={'bold'} >Word Groups</Typography>
        </LinkButton>
        </Link>
        <Link to="/words-expressions" style={{ textDecoration: 'none', color: 'black', fontSize: 20 }}><LinkButton >
          <Icon width={24} icon="arcticons:irregularexpressions" />
          <Typography variant='h6' ml={2} fontWeight={'bold'} >Expressions</Typography>
        </LinkButton>
        </Link>
      </Stack>
      <Stack direction={smallScreen ? 'column' : 'row'} gap={4} width={'55%'} justifyContent={smallScreen ? 'center' : 'space-between'} alignItems={'center'}>
        <Link to="/stats" style={{ textDecoration: 'none', color: 'black', fontSize: 20 }}><LinkButton >
          <Icon width={24} icon="flat-color-icons:statistics" />
          <Typography variant='h6' ml={2} fontWeight={'bold'} >Statistics</Typography>
        </LinkButton>
        </Link>
        <Link to="/data-mining" style={{ textDecoration: 'none', color: 'black', fontSize: 20 }}><LinkButton >
          <Icon width={24} icon="icon-park:data-sheet" />
          <Typography variant='h6' ml={2} fontWeight={'bold'} >Data Mining</Typography>
        </LinkButton>
        </Link>
      </Stack>
      <UploadDocument open={open} handleOpen={handleOpen} />
    </Stack>

  );
}

export default HomePage;
