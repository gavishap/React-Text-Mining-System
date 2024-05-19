import { useState, useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Modal, OutlinedInput, Select, SelectChangeEvent, Stack, Theme, Typography, styled, useTheme } from '@mui/material';
import { Icon } from '@iconify/react/dist/iconify.js';
import Hearder from '../components/common/Header';


interface ToggleInterface {
    action: string;
    active: boolean;
}

export default function WordExpression({ documents }: any) {
    const [toggle, setToggle] = useState<ToggleInterface[]>([
        {
            action: 'GroupList',
            active: true
        },
        {
            action: 'AddGroup',
            active: false
        },
        {
            action: 'AddWord',
            active: false
        }
    ])

    const [selectedDoc, setSelectedDoc] = useState<any>(documents[0])
    const [selectedText, setSelectedText] = useState<string[]>([])
    const [isGroup, setIsGroup] = useState<boolean>(true);
    const [wordsList, setWordsList] = useState<any>([])
    const [documentText, setDocumentText] = useState<string[]>([])
    const [groupsList, setGroupList] = useState<any>([])
    const [expressionInput, setExpressionInput] = useState<string>('')



    const onGroupSelect = (data: any) => {
        let arr = [...groupsList].filter((item: any) => item?.name === data?.name)
        if (arr.length > 0)
            setWordsList([...arr[0]?.words?.split(" ")])
        setIsGroup(false)
    }

    //   function to get all text from document
    async function getDocumentData(filename: any) {
        try {
            console.log("Filename: ", filename)
            const res = await fetch(`http://localhost:5000/documents_list?filename=${filename}`)
            const data = await res.json()
            setDocumentText([...data])
        } catch (e) {
            console.log("Error Occured Fetching groups: ", e);
        }
    }

    async function saveNewDecleration() {
        if (!expressionInput)
            return;
        fetch("http://localhost:5000/decleration", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                decleration: expressionInput,
                words_decleration: selectedText.join(" ")
            })
        })
            .then(res => {
                if (res.status >= 200) {
                    setExpressionInput('')
                    setSelectedText([])
                    setOpen1(false)
                    alert("Decleration Added Successfully !!!")
                }
            })
            .then(data => console.log(data))
            .catch(err => console.log(err))
    }

    async function fetchWordGroups() {
        try {
            const res = await fetch('http://localhost:5000/declarations')
            const data = await res.json()
            console.log("Data: ", data)
            setGroupList([...data])
        } catch (e) {
            console.log("Error Occured Fetching Declarations: ", e);
        }
    }

    useEffect(() => {
        console.log("Selected Doc: ", selectedDoc)
        getDocumentData(selectedDoc?.name);
    }, [selectedDoc])


    useEffect(() => {
        fetchWordGroups()
    }, [])

    const updateToggle = (action: string) => {
        let arr: ToggleInterface[] = [...toggle];
        arr.forEach((item: ToggleInterface) => {
            if (item?.action === action) {
                item.active = true
                if (item?.action === 'GroupList') {
                    fetchWordGroups();
                }
            } else {
                item.active = false;
            }
        })

        setToggle([...arr])
    }

    const WordBox = styled(Box)(({ theme }) => ({
        padding: 16,
        border: '1px solid',
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        alignItems: 'center',
        width: 200,
        justifyContent: 'center',
        cursor: 'pointer',
        margin: 8
    }));

    const [open1, setOpen1] = useState(false);
    const theme = useTheme();
    const handleChange = (event: SelectChangeEvent<typeof selectedText>) => {
        const {
            target: { value },
        } = event;
        setSelectedText(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    function getStyles(name: string, personName: readonly string[], theme: Theme) {
        return {
            fontWeight:
                personName.indexOf(name) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }


    return (
        <Stack direction={'column'} gap={4} alignItems={'center'}>

            <Hearder title='Manage Word Expressions' />

            <Box border={1} borderRadius={3} p={3} gap={2} maxHeight={'70vh'} width={'80%'} display={'flex'} justifyContent={'center'} alignItems={'center'} >
                {/* display word groups */}
                {
                    toggle.map((item: ToggleInterface) => {
                        return (
                            <>
                                {item.action === 'GroupList' && item.active && <Box width={'100%'}  >
                                    <Stack direction={'column'} alignItems={'center'} >

                                        {!isGroup && <Box width={'100%'} display={'flex'}><Icon width={24} icon="ep:back" style={{ cursor: 'pointer' }} onClick={() => setIsGroup(true)} /></Box>}
                                        {isGroup ? <Grid container justifyContent={'center'}>
                                            {groupsList.map((group: any) => (
                                                <WordBox key={group?.name} onClick={() => onGroupSelect(group)}>
                                                    {group?.name}
                                                </WordBox>
                                            ))}
                                        </Grid> :
                                            <Grid container justifyContent={'center'}>

                                                {wordsList.map((word: any) => (
                                                    <WordBox key={word} >
                                                        {word}
                                                    </WordBox>
                                                ))}
                                            </Grid>

                                        }
                                    </Stack>
                                </Box>
                                }
                            </>
                        )
                    })
                }
            </Box>

            <Modal
                open={open1}
                onClose={() => {
                    setOpen1(false)
                    updateToggle('GroupList')
                }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >

                <Box
                    bgcolor={'white'}
                    width={500}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    p={3}
                    gap={3}
                >

                    <Typography variant='h4'>Add Word</Typography>
                    <Stack direction={'column'} justifyContent={'center'} alignItems={'center'} gap={1}>
                        <select onChange={(e) => {
                            const str = e.target.value.replace(".txt", "")
                            const obj = documents.find((item: any) => item?.name === str);
                            setSelectedDoc(obj)
                        }}
                            style={{
                                width: '100%',
                                height: 55
                            }}
                        >
                            {
                                documents?.map((doc: any) => {
                                    return (
                                        <option>{doc?.name + ".txt"}</option>
                                    )
                                })
                            }
                        </select>
                        <input type='text'
                            onChange={(e) => setExpressionInput(e.target.value)}
                            placeholder='Enter expression name ...'
                            style={{
                                width: 350,
                                height: 50
                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="demo-multiple-chip-label">Select words</InputLabel>
                            <Select
                                labelId="demo-multiple-chip-label"
                                id="demo-multiple-chip"
                                multiple
                                value={selectedText}
                                onChange={handleChange}
                                input={<OutlinedInput id="select-multiple-chip" color='primary' label="Select words" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                sx={{
                                    width: '100%'
                                }}
                            >
                                {documentText.map((name, index) => (
                                    <MenuItem
                                        key={index}
                                        value={name}
                                        style={getStyles(name, selectedText, theme)}
                                    >
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Button
                        variant={'contained'}
                        onClick={() => saveNewDecleration()} >Save Expression</Button>

                </Box>

            </Modal>
            <Stack direction={'row'} gap={3} justifyContent={'space-around'} width={'80%'}>
                <Button
                    variant={'contained'}
                    onClick={() => {
                        setOpen1(true)
                    }} >Add Expression</Button>
            </Stack>
        </Stack >
    )
}
