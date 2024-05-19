import { Stack, useMediaQuery, useTheme } from "@mui/material";

interface Filter {
    documentId: string;
    doc_id: string;
    startingLetter: string;
    paragraph: string;
    sentence: string;
    lineNumber: string;
}

const FormContent = ({filters, handleFilterChange} : {filters : Filter, handleFilterChange : (e: React.ChangeEvent<HTMLInputElement>) => void}) => {

    const styles = {
        padding: 16,
        width: 350
    }
    
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <>


            <Stack
                sx={{ width: smallScreen ? '100%' : '70%' }}
                direction={smallScreen ? 'column' : 'row'}
                justifyContent={smallScreen ? 'center' : 'space-between'}
                alignItems={'center'} gap={3}>

                <input style={styles} name="doc_id" placeholder="Filter by Document ID" value={filters.doc_id} onChange={handleFilterChange} />
                <input style={styles} name="startingLetter" placeholder="Searching Letter" value={filters.startingLetter} onChange={handleFilterChange} />

            </Stack>

            <Stack
                sx={{ width: smallScreen ? '100%' : '70%' }}
                direction={smallScreen ? 'column' : 'row'}
                justifyContent={smallScreen ? 'center' : 'space-between'}
                alignItems={'center'} gap={3}>

                <input style={styles} name="paragraph" placeholder="Paragraph Number" value={filters.paragraph} onChange={handleFilterChange} />
                <input style={styles} name="sentence" placeholder="Sentence Number" value={filters.sentence} onChange={handleFilterChange} />

            </Stack>

            <Stack
                sx={{ width: smallScreen ? '100%' : '70%' }}
                direction={smallScreen ? 'column' : 'row'}
                justifyContent={smallScreen ? 'center' : 'space-between'}
                alignItems={'center'} gap={3}>

                <input style={styles} name="lineNumber" placeholder="Line Number" value={filters.lineNumber} onChange={handleFilterChange} />

            </Stack>
        </>
    )
}

export default FormContent;