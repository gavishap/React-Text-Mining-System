import { Box, Button, Modal, TextField, Typography } from "@mui/material"


interface InputData {
    id: number;
    text: string;
}

export const AddGroupModal = ({ open, setOpen, saveToDB, groupInput, setGroupInput }: {
    open: boolean,
    setOpen: () => void,
    saveToDB: () => void,
    groupInput: InputData,
    setGroupInput: (value: React.SetStateAction<InputData>) => void
}) => {
    return (
        <Modal
            open={open}
            onClose={setOpen}
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
                <Typography variant='h4'>Add Group</Typography>
                <TextField value={groupInput.text} onChange={(e) => {
                    setGroupInput({
                        id: groupInput.id, text: e.target.value
                    })
                }} placeholder='Enter group name ...' fullWidth />

                <Button variant='contained' className="word-item" fullWidth
                    onClick={() => saveToDB()}
                >Save Group</Button>
            </Box>

        </Modal>
    )
}

export const AddWordToGroupModal = ({ open, setOpen, saveToDB, groupsList, setWordInput, wordInput }: {
    open: boolean,
    setOpen: () => void,
    saveToDB: () => void,
    groupsList: any,
    setWordInput: (value: React.SetStateAction<InputData>) => void,
    wordInput: InputData
}) => {
    return (
        <Modal
            open={open}
            onClose={setOpen}
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
                <select onChange={(e) => {
                    const obj = groupsList.find((item: any) => item?.name === e.target.value)
                    console.log(obj?.id, 'obj')
                    setWordInput((prev: InputData) => {
                        return { ...prev, id: obj?.id }
                    })
                }

                }
                    style={{
                        width: '100%',
                        height: 60,
                    }}
                >
                    <>
                        <option>Select a group</option>
                        {
                            groupsList?.map((item: any, index: any) => {
                                return (
                                    <option key={item?.name + index.toString()}>{item?.name}</option>
                                )
                            })
                        }
                    </>

                </select>
                <TextField value={wordInput.text} variant='filled'
                    sx={{ backgroundColor: 'white' }}
                    onChange={(e) => setWordInput((prev: InputData) => {
                        return { ...prev, text: e.target.value }
                    })}
                    placeholder='Enter word ...' fullWidth />
                <Button variant='contained'
                    onClick={() => {
                        console.log("is here")
                        saveToDB()
                    }}
                >Save Word To Group</Button>

            </Box>

        </Modal>
    )
}