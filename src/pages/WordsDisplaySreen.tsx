// WordsDisplayPage.tsx
import React, { useState } from 'react';
import WordsList from '../components/ListOfWords/ListOfWords';
import WordContextViewer from '../components/WordComponents';
import { Icon } from '@iconify/react';
import { Box, Modal, Pagination, Stack, styled } from '@mui/material';
import Hearder from '../components/common/Header';
import FormContent from '../components/DisplayScreen/Form';

interface Filter {
    documentId: string;
    doc_id: string;
    startingLetter: string;
    paragraph: string;
    sentence: string;
    lineNumber: string;
}

const WordsDisplayScreen = () => {
    const [selectedWord, setSelectedWord] = useState<string>('');
    const [isWordVisible, setIsWordVisible] = useState<boolean>(false);
    const [filters, setFilters] = useState<Filter>({
        documentId: '',
        doc_id: '',
        startingLetter: '',
        paragraph: '',
        sentence: '',
        lineNumber: ''
    });

    const [numberOfWords, setNumberOfWord] = useState(0);

    const handleWordSelect = (word: string) => {
        setIsWordVisible(true)
        setSelectedWord(word);
    };

    const [page, setPage] = useState(1);
    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        console.log(event);
    };

    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsWordVisible(false)
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const PreviewModal = styled(Modal)(() => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }))

    const PreviewModalContainer = styled(Box)(({ theme }) => ({
        padding: 16,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: 'white',
        display:'flex',
        alignItems: 'center',
        flexDirection : 'column'
    }));

    return (
        <Stack direction={'column'} alignItems={'center'} gap={3} >
            
            <Hearder title='Display Words' />

            <FormContent filters={filters} handleFilterChange={handleFilterChange}/>

            <Box sx={{ width: '70%' }}>

                {isWordVisible ?
                    <PreviewModal open={isWordVisible} onClose={() => setIsWordVisible(false)}>
                        <PreviewModalContainer>
                            <Stack direction={'row'} justifyContent={'right'} width={'100%'}>
                            <Icon icon="ic:round-close" width={24} onClick={() => setIsWordVisible(false)} />
                            </Stack>
                            <WordContextViewer word={selectedWord} filters={filters} />
                        </PreviewModalContainer>
                    </PreviewModal>
                    :
                    <Stack direction={'column'} alignItems={'center'} gap={2}>
                        {numberOfWords > 30 ? (
                            <>
                                <WordsList onWordSelect={handleWordSelect} filters={filters} setWordNumber={setNumberOfWord} startSplit={0 + (30 * (page - 1))} endSplit={30 + (30 * (page - 1))} />
                                <Pagination count={Math.ceil(Math.ceil(numberOfWords / 30))} color="primary" onChange={handleChange} />
                            </>
                        ) : (
                            <>
                                <WordsList onWordSelect={handleWordSelect} filters={filters} setWordNumber={setNumberOfWord} startSplit={0} endSplit={30} />
                            </>
                        )}

                    </Stack>
                }

            </Box>

        </Stack>


    );
};

export default WordsDisplayScreen;
