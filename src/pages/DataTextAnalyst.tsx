import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormControl, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Icon } from '@iconify/react/dist/iconify.js';
import Hearder from '../components/common/Header';

export default function DataMining({ documents }: any) {
    const navigate = useNavigate();
    const [selectedDoc, setSelectedDoc] = useState<any>(documents[0])
    const [miningData, setMiningData] = useState<any>({})
    const [keys, setKeys] = useState<any[]>([])
    const [tableData, setTableData] = useState<any[][]>([]);


    async function getFileMining() {
        if (!selectedDoc?.name) return;
        try {
            const res = await fetch(`http://localhost:5000/data_mining?filename=${selectedDoc?.name}`)
            const data = await res.json()
            const response = formatResponse(data)
            handleTableData([...response?.keys], { ...response?.res })
            setMiningData({ ...response?.res })
            setKeys([...response?.keys])
        } catch (e) {
            console.log("Error Occured Fetching groups: ", e);
        }
    }

    const handleTableData = (keys: any[], value: any) => {
        let index = 0;
        const arrayfinal: any[][] = []
        const maxlength = value[keys[0]].length;

        while (maxlength > index) {
            const array = []
            for (let i = 0; i < keys.length; i++) {
                if (value[keys[i]][index]) {
                    array.push(value[keys[i]][index]);
                } else {
                    array.push('');
                }
            }
            index++;
            arrayfinal.push(array);
        }
        setTableData(arrayfinal)
    }

    useEffect(() => {
        getFileMining();
    }, [selectedDoc])

    const formatResponse = (arr: any) => {

        const t = arr.map((item: any, i: number) => {
            return Object.values(item)[1]
        })
        const keys = new Set([...t])
        let res: any = {}
        for (const key of keys) {
            res[key] = []
        }

        arr.forEach((item: any, i: number) => {
            let temp = res[item?.type]
            temp.push(item?.text)
            res[item?.type] = temp
        })

        return { keys, res };
    }

    return (
        <Stack direction={'column'} alignItems={'center'} gap={8}>
            <Hearder title={'Data Mining'} />
            <Stack direction={'column'} gap={4} width={'90%'} alignItems={'center'}>
                <FormControl sx={{ width: '50%' }}>
                    <InputLabel id="demo-simple-select-helper-label">Select Doc</InputLabel>
                    <Select
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        value={selectedDoc}
                        label="Select Doc"
                        onChange={(e: any) => {
                            const str = e.target.value.replace(".txt", "")
                            const obj = documents.find((item: any) => item?.name === str);
                            setSelectedDoc(obj)
                        }}
                        sx={{ width: '100%' }}
                    >
                        {
                            documents?.map((doc: any) => {
                                return (
                                    <MenuItem value={doc?.name}>{doc?.name + ".txt"}</MenuItem>
                                )
                            })
                        }

                    </Select>
                </FormControl>


                <Stack direction={'column'} alignItems={'center'} gap={4} width={'100%'}>
                    <Typography variant='h6' fontWeight={'bold'}>Result from Data mining algorithm</Typography>

                    <Stack width={'100%'} >
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {
                                            keys?.map((item: string, i: number) => {
                                                return (
                                                    <TableCell
                                                        key={item + i.toString()}
                                                        align='center'
                                                        style={{ width: Math.ceil(100 / keys?.length) + "%" }}
                                                    >
                                                        <Typography variant='body1' fontWeight={'bold'}>{item}</Typography>
                                                    </TableCell>
                                                )
                                            })
                                        }
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        tableData.map((value: any, indexs: number) => (
                                            <TableRow hover key={indexs} role="checkbox" tabIndex={-1} >
                                                {value?.map((key: any, index: number) => (
                                                    <TableCell align='center' key={"child-" + index}>{key}</TableCell>

                                                ))}
                                            </TableRow>
                                        ))

                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    )
}
