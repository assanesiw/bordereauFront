/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { ActionIcon, Box, Button, Divider, Group,  LoadingOverlay, Modal, NumberInput, SimpleGrid, Table, Text, Textarea, TextInput,  } from "@mantine/core"
import Typewriter from 'typewriter-effect';
import { FcFile, FcPlus} from "react-icons/fc";
import { DateInput } from '@mantine/dates';
import { z } from "zod";
import { randomId, useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { createBordereau, deleteBordereau, getBordereaus, updateBordereau } from "./services/bordereau";
import { notifications } from '@mantine/notifications';
import { IconArrowRight, IconTrash } from '@tabler/icons-react';
import { DataTable } from "mantine-datatable";
import { format } from "date-fns";
import { IconEdit } from "@tabler/icons-react";
import { IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import { font } from "./vfs_fonts";
pdfMake.vfs = font
import { Popconfirm, QRCode } from "antd";
import { IconSearch } from "@tabler/icons-react";
import { useNavigate, } from 'react-router-dom';
import useSignOut from 'react-auth-kit/hooks/useSignOut';



const schema = z.object({
  date:z.date(),
  num_serie:z.string(),
  observation:z.string(),
  designataire:z.string(),
  lignes:z.array(z.object({analyse:z.string(),nb_piece:z.number()})), 
  });

function Bordereau() {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [Opened, { open, close }] = useDisclosure(false);
  const [Yesopened, { open: opR, close:clR }] = useDisclosure(false);
  const [openedV, { open: opV, close:clV }] = useDisclosure(false);
  const [curB,setCurB] = useState(null)
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const key = 'get_Bordereaux';
        const qc = useQueryClient();
        const {data: Bordereaux ,isLoading} = useQuery(key,() => getBordereaus());
        const confirm = () => {
          signOut();
          navigate('/login');
        };
  const form = useForm({
    initialValues: {
      date:'',
      num_serie:'',
      observation: '',
      designataire: '',
      lignes: [{ analyse: '', nb_piece: 0, key: randomId() }],
     },
    validate: zodResolver(schema),
  });
  const formU = useForm({
    initialValues: {
      date:'',
      num_serie:'',
      observation: '',
      designataire: '',
      lignes: [{ analyse: '', nb_piece: 0, key: randomId() }],
     },
    validate: zodResolver(schema),
  });

  const {mutate,isLoading:isLoadingR} = useMutation((val) => createBordereau(val),{
    onSuccess:() => {
      notifications.show({
        title: 'creation bordereaux',
        message: 'le bordereau a ete cree avec succee',
        color: 'green'
      }),
      qc.invalidateQueries(key);
      close();
      form.reset();
    },
    onError:console.log
  })
  const {mutate: updR,isLoading:loaR} = useMutation((data) => updateBordereau(data._id,data.val),{
    onSuccess:() => {
      notifications.show({
        title: 'mise a jours matiere',
        message: 'matiere modifier avec succee',
        color: 'green'
      })
      qc.invalidateQueries(key);
      clR();
    }
  })
  const {mutate: delB,isLoading:loadR} = useMutation((id) => deleteBordereau(id),{
    onSuccess:() => {
      notifications.show({
        title: 'supprimer bprdereau',
        message: 'bordereau supprime avec succee',
        color: 'red'
      })
      qc.invalidateQueries(key);
    }
  });
  const save = (valeurs) => {
    valeurs.lignes = valeurs.lignes.map(l => ({analyse:l.analyse,nb_piece:l.nb_piece}))
    if (valeurs.designataire === '') {
      const { designataire,...rest} = valeurs;
      valeurs = {...rest};
    }
    mutate(valeurs);
   }
   const handleDelete  = (row) => {
    delB(row._id);
   };
   const handleUpdate= (row) => {
    const {date,nb_piece} = row;
   formU.setValues({...row,nb_piece: +nb_piece, date: +date});
   opR();
   };
   const handleView=(row) =>{
    setCurB(row);
    opV();
   };
   const updateM = (val) => {
    const {_id,...rest} = val;
    updR({_id,val:rest});
   }
const lignes = form.getValues().lignes.map((item, index,arr) => (
  <div key={index} className='flex space-x-1 my-1 items-center justify-center'>
     <Textarea
    label="ANALYSE" placeholder="analyse" className='w-2/3'   withAsterisk
        required key={form.key(`lignes.${index}.analyse`)} {...form.getInputProps(`lignes.${index}.analyse`)}/>
 <NumberInput label="NOMBRE PIECE" className='w-1/3'  placeholder="nombre piece" key={form.key(`lignes.${index}.nb_piece`)} required {...form.getInputProps(`lignes.${index}.nb_piece`)}/>
    {arr.length > 1 && <ActionIcon className='mt-5' bg='red' color="white" onClick={() => form.removeListItem('lignes', index)}>
      <IconTrash size="1rem" />
    </ActionIcon>}
    <ActionIcon className='mt-5' aria-label="default action icon" size="lg" bg="cyan"  onClick={() =>
      form.insertListItem('lignes', { analyse: '', nb_piece:0, key: randomId() })
    }>
              <FcPlus/>
            </ActionIcon>
  </div>
));
const PAGE_SIZES = [10, 15, 20];
const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
useEffect(() => {
  setPage(1);
}, [pageSize]);

const [page, setPage] = useState(1);
const [records, setRecords] = useState(Bordereaux?.slice(0, pageSize));

useEffect(() => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  setRecords(Bordereaux?.slice(from, to).filter(({num_serie}) => {
    if (
      debouncedQuery !== '' &&
      !`${num_serie}`.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
    )
    return false
    return true
  } 
  ));
}, [page, pageSize, Bordereaux,debouncedQuery]);

const generer = (row) => {
  var dd = {
      content:[ 
            {
              columns: [
                {   
           stack: [                        
                      {text: 'REPUBLIQUE DU SENEGAL ', fontSize: 12, bold: true, alignment:'center'},
                      {text: '**************', fontSize: 12, bold: false, alignment:'center'},   
           
            {text: 'MINISTERE DE L ENSEIGNEMENT SUPERIEUR, DE LA RECHERCHE ET DE L INNOVATION', fontSize: 10, bold: false, alignment:'center'},
            {text: '************', fontSize: 12, bold: false, alignment:'center'},
            {text: 'CENTRE REGIONAL DES OEUVRES UNIVERSITAIRES SOCIALES DE ZIGUINCHOR (CROUS/Z)', fontSize: 10, bold: false, alignment:'center'},
            {text: '************', fontSize: 12, bold: false, alignment:'center'},
            {text: 'AGENT COMPTABLE', fontSize: 10, bold: false, alignment:'center'},
          
                    ]
                    
                  
                },
              
              
                {
                 
                  text: [
                      
                    {text: '', fontSize: 12, bold:true, alignment:'center'},
                    {text: '\nN°:.................MESRI/CROUSZ/AC\n', fontSize: 11, bold: true, alignment:'center'},
                    {text: '', fontSize: 12, bold:true, alignment:'center'},
                    {text: `\nZiguinchor,le ${format(row.date,'dd/MM/yyyy')}`, fontSize: 11, bold: true, alignment:'center'},
                  ]
                }
              ]
            },
              {
                style: 'tableExample',
                fillColor:'#40E0D0',
                margin: [20, 10],
                table: {
                  widths: ['*'],
                  body: [
                    [{text: "BORDEREAU D'ENVOI",color:'black', fontSize: 20, bold: true, alignment:'center'}],
                  ]
                }
              },
              {text: '____________________________________________________________________________', fontSize: 14, bold: false, alignment:'center'},
              {text: '\n\n', fontSize: 10, bold: false, alignment:'center'},
              {text: `${row.designataire}\n\n\n`, fontSize: 13, bold: true,color:'black', alignment:'center'},
              
              
              {
                style: 'tableExample',
                bold:true,
               fillColor:'',
                table: {
                  widths: [50,250, 70,95],
                    body: [
                        [{ text:'N°',style: 'tableHeader',alignment: 'center'}, { text:'ANALYSE',style: 'tableHeader',alignment: 'center'}, { text:'NOMBRE DE PIECES',style: 'tableHeader',alignment: 'center'},{ text:'OBSERVATIONS',style: 'tableHeader',alignment: 'center', }],
                         // eslint-disable-next-line no-unsafe-optional-chaining
                         ...row.lignes.map((l, index)=>{ 
                          return  [{text:index+1, alignment:'center'}, {text: l.analyse, alignment:'center',bold:false}, {text: l.nb_piece, alignment:'center'},  {text: index === 0 ? `\n\n\n${row.observation}`  : '', rowSpan: index === 0 ? row.lignes.length : 0, fontSize: 11, bold: false,color:'black', alignment:'center',justify:'center'}];
                      }),
                      [{ text:'',style: 'tableHeader', alignment: 'center'}, { text:'TOTAL PIECES',style: 'tableHeader',bold: true ,alignment: 'center'}, {text:`${row.lignes.reduce((acc,val) => acc + val.nb_piece ,0)}`, alignment:'center'},''], 
                    ]
                }
            },
          
            {
              columns: [
                {   
           stack: [                        
                     
           
            {text: '', fontSize: 10, bold: false, alignment:'center'},
           
          
                    ]
                    
                  
                },
              
              
                {
                 
                  text: [
                      
                    {text: '', fontSize: 12, bold:true, alignment:'center'},
                    {text: '', fontSize: 11, bold: true, alignment:'center'},
                    {text: `\n\n\n\nL'agent Comptable\n\n\n\n\n\n`, fontSize: 13, bold:true, alignment:'center'},
                    {text: '', fontSize: 11, bold: true, alignment:'center'},
                  ]
                }
                
              ]
            },
          
              { qr:`${row.observation}`,fit: '100', alignment:'center' },     
         
            
      ]
      

  }
  pdfMake.createPdf(dd).open();
}
  return (
    <>
    <LoadingOverlay
          visible={isLoading || isLoadingR || loadR || loaR}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'blue', type: 'bars' }}
        />
    <div className="min-h-full border-spacing-4">
    <nav className="flex items-center justify-between bg-gradient-to-tr from-white to-white mt-6 ml-14">
    <Typewriter
       options={{loop:true,autoStart:true, wrapperClassName:"text-green-500 text-4xl font-bold",cursorClassName:"text-green-500 text-3xl", cursor:"🖊"}}
       onInit={(typewriter) => {
     typewriter.typeString('GESTION DES BORDEREAUX DE L AGENT COMPTABLE CROUS/ZIGUINCHOR')
       .pauseFor(1000)
       .deleteAll()
       .start()
       
   }}
   />

   <div className=" items-center justify-between py-3 mt-4 ">
        <Popconfirm
        title="DECONNECTER"
        description="Etes vous sure?"
        onCancel={null}
        okText="OUI"
        okButtonProps={{className:'bg-green-500'}}
        cancelText="NON"
        onConfirm={confirm}>
      <Button bg='green-300'>
               DECONNECTER  
              </Button>
              </Popconfirm>
              </div>
    </nav>
    <div className="text-center  mt-6">
    <Button className='w-45 h-12 font-bold' bg='blue' leftSection={<FcPlus />} onClick={open} >NOUVEAU BORDEREAU</Button>  
    </div>
    <div className="card mt-4 w-10/12 mx-auto">
    <div className="w-5/12 mx-auto my-5">
    <TextInput
           label="RECHERCHER"
           placeholder="rechercher..."
           radius="xl"
           size="md"
           leftSection={<IconSearch size={16} />}
           rightSection={
            <ActionIcon size={32} radius='xl' variant="filled" c="blue" onClick={() => setQuery('')}>
              <IconArrowRight size={32} stroke={1.5} color="white"/>
            </ActionIcon>
          }
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
           />
           </div>
    <DataTable
    
    
     totalRecords={Bordereaux?.length}
     paginationActiveBackgroundColor="grape"
     recordsPerPage={pageSize}
     page={page}
     onPageChange={(p) => setPage(p)}
     recordsPerPageOptions={PAGE_SIZES}
     onRecordsPerPageChange={setPageSize}
     backgroundColor={{ dark: '#232b25', light: '#f0f7f1' }}
      
     styles={{
      // 👇 this is a function that receives the current theme as argument
      root: (theme) => ({
        border: `1px solid ${theme.colors.orange[6]}`,
      }),
      table: {
        color: '#666',
      },
      header: {
        color: '#A30',
        fontSize: '125%',
      },
    }}
    
      columns={[
        {
           accessor: 'date',align:'center',render:({date}) => format(date,'dd/MM/yyyy'),
           filtering: query !== '',
          },
           
           
          //  ,{
          //    accessor: 'num_serie',align:'center',
          //    }, 
             { accessor: 'designataire',align:'center' }, 
             { accessor: 'observation',align:'center' }, 

               {
                accessor: 'actions',
               title: <Box mr={6}>Action</Box>,
                textAlign: 'right',
               render: (row) => (
              <Group gap={4} justify="right" wrap="nowrap">
               <ActionIcon
              size={32}
              variant="subtle"
              color="green"
              onClick={()=>handleView(row)}
            >
              <IconEye size={32} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={()=>handleUpdate(row)}
        
            >
              <IconEdit size={32} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              
              onClick={() =>handleDelete(row)}
            >
              <IconTrash size={32} />
            </ActionIcon>
          </Group>
        ),
      },]}
      records={records}
      idAccessor="_id"
    />
      </div>    
    <Modal opened={Opened} size='lg' onClose={close} title="">
        <form onSubmit={form.onSubmit(save)}>
        <Text fz="lg" fw={700} className="{classes.title} text-center text-green-800">
            AJOUTEZ UN BORDEREAU
          </Text>
          <div>

          <DateInput label="DATE" placeholder="date" locale='fr' required {...form.getInputProps('date')}/>
          {/* <TextInput label="Numero Serie" placeholder="numero serie"  {...form.getInputProps('num_serie')}/> */}
          <SimpleGrid >
            {lignes}
          </SimpleGrid>
          <Textarea label="OBSERVATION" placeholder="observation" required {...form.getInputProps('observation')}/> 
          <Textarea label="DESIGNATION" placeholder="Des piéces adressées a Monsieur le Directeur du secteur parapublic (DSP) s/c du Directeur général de la comptabilité publique et du tresor (DGCPT)" {...form.getInputProps('designataire')}/> 
          <Group justify="flex-end" mt="md" >
          <Button type="submit" bg='cyan'>
               ENREGISTRER
              </Button>
          </Group>
          <Divider label="@CROUS/Z" labelPosition="center" my="lg" />
          </div>
        </form>
        </Modal>
    </div>
    <div> <Modal opened={Yesopened} size='lg' onClose={clR} title="">
        <form onSubmit={formU.onSubmit((values) => updateM(values))}>
        <Text fz="lg" fw={700} className="{classes.title} text-center text-green-800">
           MODIFIER BORDEREAU
          </Text>
          <div>

          <DateInput label="DATE" placeholder="date" locale='fr' required {...formU.getInputProps('date')}/>
          {/* <TextInput label="Numero Serie" placeholder="numero serie" required {...formU.getInputProps('num_serie')}/> */}
          <SimpleGrid >
            {lignes}
          </SimpleGrid>
          <Textarea label="OBSERVATION" placeholder="observation" required {...formU.getInputProps('observation')}/> 
          <Textarea label="DESIGNATION" placeholder="designation" required {...formU.getInputProps('designataire')}/> 
          <Group justify="flex-end" mt="md" >
          <Button type="submit" bg='cyan'>
                MISE A JOURS BORDEREAU
              </Button>
          </Group>
          <Divider label="@CROUS/Z" labelPosition="center" my="lg" />
          </div>
        </form>
        </Modal></div>
        <div>
          <Modal opened={openedV} onClose={clV} fw={700} size="100%" title="crousz">
            {curB && <div>
            <Text fz="lg" fw={700} className="text-center  text-red-800">LE BORDEREAU N° SERIE : DU {format(curB.date,'dd/MM/yyyy')}</Text>  
            <div className="card mt-4 w-10/12 mx-auto">
            <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>N°</Table.Th>
          <Table.Th>ANALYSE</Table.Th>
          <Table.Th>NOMBRE DE PIECES</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
    {curB.lignes.map((l,i) => (
    <Table.Tr key={i}>
      <Table.Td>{i+1}</Table.Td>
      <Table.Td>{l.analyse}</Table.Td>
      <Table.Td>{l.nb_piece}</Table.Td>
    </Table.Tr>
  ))}
      </Table.Tbody>
    </Table>
      <div className="items-center text-center">
      Observation : {curB.observation}
      </div>
      </div>  
      <div className="text-1xl font-semibold text-center">
       <QRCode value={curB.observation}/>
    </div>
      <div className='text-center  mt-4'>
        <Button  className='w-45 h-12 font-bold' bg='blue' leftSection={<FcFile/>}  onClick={() => generer(curB)}> GENERER BORDEREAU </Button>
    </div>
            </div>}
          </Modal>
        </div>
    </>
  )
}

export default Bordereau