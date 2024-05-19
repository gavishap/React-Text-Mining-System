import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Card, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Typography, styled, useMediaQuery, useTheme } from '@mui/material';
import { Icon } from '@iconify/react/dist/iconify.js';
import Hearder from '../components/common/Header';

export default function Statistics({ documents }: any) {
  const navigate = useNavigate();
  const [documentText, setDocumentText] = useState<string[]>([])
  const [selectedDoc, setSelectedDoc] = useState<any>(documents[0])
  const [chartKeys, setChartKeys] = useState<string[]>([''])
  const [chartVals, setChartVals] = useState<number[]>([0])

  const [statsData, setStatsData] = useState<any>({})
  const [activeCardData, setActiveCardData] = useState<any>({
    paragraph: {},
    sentence: {}
  })

  //   function to get all text from document
  async function getDocumentData(filename: any) {
    try {
      const res = await fetch(`http://localhost:5000/documents_list?filename=${filename}`)
      const data = await res.json()
      setDocumentText([...data])
    } catch (e) {
      console.log("Error Occured Fetching groups: ", e);
    }
  }

  async function getFileStats() {
    try {
      const res = await fetch(`http://localhost:5000/statistics?filename=${selectedDoc?.name}`)
      const data = await res.json()
      const values: number[] = Object.values(data?.stats);
      const keys: string[] = Object.keys(data?.stats)

      console.log(keys)

      setChartVals([...values])
      setChartKeys([...keys])

      setStatsData(data)
    } catch (e) {
      console.log("Error Occured Fetching groups: ", e);
    }
  }

  useEffect(() => {
    getDocumentData(selectedDoc?.name);
    getFileStats();
  }, [selectedDoc])

  const theme = useTheme();

  const StatisticCards = styled(Card)(({ theme, colors }: { colors: string, theme: Theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: 16,
    width: 200,
    backgroundColor: colors
  }))


  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));


  return (
    <Stack direction={'column'} alignItems={'center'} gap={4} width='100%'>

      <Hearder title='Display Statistics'/>
      <Stack direction={'column'} gap={3} width={'90%'} >

        <Stack direction={isSmallScreen ? 'column' : 'row'} gap={2}>
          <Box flex={1}>
            <Typography variant='h6' textAlign={'left'}>Select Document:</Typography>

            <select onChange={(e: any) => {
              const str = e.target.value.replace(".txt", "")
              const obj = documents.find((item: any) => item?.name === str);
              setSelectedDoc(obj)
            }}
              style={{
                height: 55,
                width: '100%'
              }}
            >
              {
                documents?.map((doc: any) => {
                  return (
                    <option key={doc?.name}>{doc?.name + ".txt"}</option>
                  )
                })
              }
            </select>
          </Box>
          <Box flex={1}>
            <Typography variant='h6' textAlign={'left'}>Paragraph Number:</Typography>

            <select onChange={(e) => {
              const obj = statsData?.paragraph?.find((item: any) => item?.paragraph === Number.parseInt(e.target.value));
              console.log("Obj: ", e.target.value)
              setActiveCardData((prev: any) => {
                return { ...prev, paragraph: { ...obj } }
              })
            }}
              style={{
                height: 55,
                width: '100%'
              }}
            >
              {
                statsData?.paragraph?.map((item: any) => {
                  return (
                    <option>{item?.paragraph}</option>
                  )
                })
              }
            </select>
          </Box>
          <Box flex={1}>

            <Typography variant='h6' textAlign={'left'}>Sentence Number:</Typography>

            <select onChange={(e) => {
              const obj = statsData?.sentence?.find((item: any) => item?.sentence === Number.parseInt(e.target.value));
              console.log("Obj: ", e.target.value)
              setActiveCardData((prev: any) => {
                return { ...prev, sentence: { ...obj } }
              })
            }}
              style={{
                height: 55,
                width: '100%'
              }}
            >
              {
                statsData?.sentence?.map((item: any) => {
                  return (
                    <option>{item?.sentence}</option>
                  )
                })
              }
            </select>
          </Box>
        </Stack>


        <Stack direction={'row'} justifyContent={'space-around'}>
          <StatisticCards colors='lightGreen' theme={theme}>
            <Typography variant='h6'>Paragraph Num: {activeCardData?.paragraph?.paragraph}</Typography>
            <Typography variant='h6'>Chars Count: {activeCardData?.paragraph?.num_characters}</Typography>
            <Typography variant='h6'>Word Count: {activeCardData?.paragraph?.num_words}</Typography>
          </StatisticCards>
          <StatisticCards colors='lightblue' theme={theme}>
            <Typography variant='h6'>Sentence Num: {activeCardData?.sentence?.sentence}</Typography>
            <Typography variant='h6'>Chars Count: {activeCardData?.sentence?.num_characters}</Typography>
            <Typography variant='h6'>Word Count: {activeCardData?.sentence?.num_words}</Typography>
          </StatisticCards>
        </Stack>


        <Stack direction={isSmallScreen ? 'column' : 'row'} gap={2}>
          <Stack flex={1} border={'1px solid lightgray'} borderRadius={2}>
            <LineChart
              xAxis={[{ scaleType: 'band', data: [...chartKeys] }]}
              series={[{ data: [...chartVals], area: true }]}
              width={isSmallScreen ? 650 : 700}
              height={500}
            />
          </Stack>

          <Stack flex={1} border={'1px solid lightgray'} borderRadius={2}>

            <TableContainer component={Paper}>

              <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" >
                      <Typography variant='h6' fontWeight={'bold'}>Total Words: {statsData?.total_letters_counts?.total_num_words}</Typography>
                    </TableCell>
                    <TableCell align="center" >
                      <Typography variant='h6' fontWeight={'bold'}>Total Letters: {statsData?.total_letters_counts?.total_num_chars}</Typography>

                    </TableCell>
                  </TableRow>
                  <TableRow >
                    <TableCell
                      align={'left'}
                    >
                      <Typography variant='body1' fontWeight={'bold'}>Word</Typography>
                    </TableCell>
                    <TableCell
                      align={'left'}
                    >
                      <Typography variant='body1' fontWeight={'bold'}>Number</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ width: '100%' }}>
                  {statsData?.frequency?.map((item: any) => (

                    <TableRow key={item?.word}>
                      <TableCell>
                        {item?.word}
                      </TableCell>
                      <TableCell>
                        {item?.count}
                      </TableCell>
                    </TableRow>

                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}


