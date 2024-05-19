import { useState, useEffect } from 'react'
import { Box, Button, Grid, Stack, styled } from '@mui/material';
import { Icon } from '@iconify/react';
import Header from '../components/common/Header';
import { AddGroupModal, AddWordToGroupModal } from '../components/WordComponents/ModalDisplay';


interface Toggle {
    action: string;
    active: boolean;
}

enum Status {
    GROUPLIST = 'GroupList',
    ADDGROUP = 'AddGroup',
    ADDWORD = 'AddWord'
}

interface InputData {
    id: number;
    text: string;
}

export default function WordGroup() {
    const [toggle, setToggle] = useState<Toggle[]>([
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


    const [groupsList, setGroupList] = useState<any>([])
    const [wordsList, setWordsList] = useState<any>([])
    const [wordInput, setWordInput] = useState<InputData>({
        id: -1,
        text: ''
    });
    const [groupInput, setGroupInput] = useState<InputData>({
        id: -1,
        text: ''
    });

    const [isGroup, setIsGroup] = useState<boolean>(true);

    const updateToggle = (action: string) => {
        let arr: Toggle[] = [...toggle];
        arr.forEach((item: Toggle) => {
            if (item?.action === action) {
                item.active = true
                if (action === 'GroupList') {
                    fetchWordGroups();
                }
            } else {
                item.active = false;
            }
        })

        setToggle([...arr])
    }

    //   fetch list of words in group
    async function fetchWordsFromGroup(data: any) {
        const obj = data;
        try {
            const res = await fetch(`http://localhost:5000/word_group/words_list?group_id=${obj?.id}`)
            const data = await res.json()
            console.log(data)
            setWordsList([...data])
        } catch (e) {
            console.log("Error Occured Fetching Words From List: ", e);
        }
    }

    const onGroupSelect = (data: any) => {
        fetchWordsFromGroup(data)
        setIsGroup(false)
    }

    //   function to get all groups
    async function fetchWordGroups() {
        try {
            const res = await fetch('http://localhost:5000/word_group')
            const data = await res.json()
            setGroupList([...data])
        } catch (e) {
            console.log("Error Occured Fetching groups: ", e);
        }
    }

    //   fetch all word groups
    useEffect(() => {
        fetchWordGroups()
    }, [])

    async function saveToDB(action: string) {
        if (action === 'word' && wordInput.id > 0 && wordInput.text.length) {
            console.log('is in word')
            fetch("http://localhost:5000/word_group/new_word", {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    group_id: wordInput.id,
                    word: wordInput.text
                })
            })
                .then(res => {
                    console.log(res)
                    if (res.status >= 200) {
                        alert("Word Added Successfully !!!")
                        setWordInput({ id: -1, text: '' })
                    }
                })
                .then(data => console.log(data))
                .catch(err => console.log(err))
        } else if (action === 'group' && groupInput.text.length > 0) {
            fetch("http://localhost:5000/word_group", {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    name: groupInput.text
                })
            })
                .then(res => {
                    if (res.status >= 200) {
                        alert("Added Successfully !!!")
                        setGroupInput({ id: -1, text: '' })
                    }
                })
                .then(data => console.log(data))
                .catch(err => console.log(err))
        }
    }

    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);

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

    return (
        <Stack direction={'column'} gap={4} alignItems={'center'}>
            <Header title='Manage Word Groups' />

            <Box border={1} borderRadius={3} p={3} maxHeight={'60vh'} width={'80%'} display={'flex'} justifyContent={'center'} alignItems={'center'} >
                {/* display word groups */}
                {
                    toggle.map((item: Toggle) => {
                        return (
                            <>
                                {item.action === Status.GROUPLIST && item.active && <Box width={'100%'}  >
                                    <Stack direction={'column'} alignItems={'center'}>

                                        {!isGroup && <Box width={'100%'} display={'flex'}><Icon width={24} icon="ep:back" style={{ cursor: 'pointer' }} onClick={() => setIsGroup(true)} /></Box>}

                                        {isGroup ? <Grid container justifyContent={'center'} >
                                            {groupsList.map((group: any) => (
                                                <WordBox key={group?.id} onClick={() => onGroupSelect(group)} >
                                                    {group?.name}
                                                </WordBox>
                                            ))}
                                        </Grid> :
                                            <Grid container justifyContent={'center'}>
                                                {wordsList.map((word: any) => (
                                                    <>
                                                        <WordBox key={word?.word_id} >
                                                            {word?.word}
                                                        </WordBox>
                                                    </>
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

            <AddGroupModal open={open}
                setOpen={() => {
                    setOpen(false)
                    updateToggle(Status.GROUPLIST)
                }}
                saveToDB={() => saveToDB('group')}
                groupInput={groupInput}
                setGroupInput={setGroupInput}
            />

            <AddWordToGroupModal open={open1}
                setOpen={() => {
                    setOpen1(false)
                    updateToggle(Status.GROUPLIST)
                }}
                saveToDB={() => {
                    saveToDB('word')
                    console.log("is here")
                }}
                groupsList={groupsList}
                setWordInput={setWordInput}
                wordInput={wordInput}
            />

            <Stack direction={'row'} gap={3} justifyContent={'space-around'} width={'80%'}>
                <Button
                    variant={'contained'}
                    onClick={() => {
                        setOpen(true)
                    }} >Add a word group</Button>
                <Button
                    variant={'contained'}
                    onClick={() => {
                        setOpen1(true)
                    }} >Add a word to a group</Button>
            </Stack>
        </Stack >
    )
}
