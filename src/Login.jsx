import { BackgroundImage, Button, Group, LoadingOverlay, Paper, PasswordInput, Stack, TextInput} from "@mantine/core"
import Typewriter from 'typewriter-effect';
import { createlogin } from "./services/user";
import { useMutation } from "react-query";
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { notifications } from "@mantine/notifications";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import { useForm } from "@mantine/form";


function Login() {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated()


  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },

    validate: {
      username: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  useEffect(() => {
    if(isAuthenticated){
      navigate('/bordereau')
    }
  })

  const {mutate,isLoading} = useMutation((val) => createlogin(val),{
    onSuccess:({data}) => {
      if(signIn({
        auth: {
            token: data.token,
            type: 'Bearer'
        },
        userState: {
            prenom: data.prenom,
            nom: data.nom,
            id: data.id
        }
    })){
      notifications.show({
        title: 'connexion',
        message: 'connexion reussite',
        color: 'green'
      })
      navigate('/bordereau');
    }else {
      notifications.show({
        title: 'connexion',
        message: 'impossible de se connecter',
        color: 'red'
      })
    }
     
    },
    onError:console.log
  })
  const Connect = (valeurs) => { 
    mutate(valeurs);
   }


 
  return (
    <>
     <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'blue', type: 'bars' }}
        />
    <div className="flex items-center h-screen">
    <div className="h-full w-1/3">
    <Paper mt={50} p={30}>
    <div className="flex flex-col items-center w-full">
    <Typewriter
      options={{loop:true,autoStart:true, wrapperClassName:"text-green-500 text-2xl font-bold",cursorClassName:"text-green-500 text-2xl", cursor:"🖊"}}
      onInit={(typewriter) => {
    typewriter.typeString('SECRETARIA AGENT COMPTABLE')
      .pauseFor(1000)
      .deleteAll()
      .start()
      
  }}
/>
   <img className="w-48 h-35 mt-20" src="/crousz.jpg" alt="crousz"/>
   <form onSubmit={form.onSubmit(Connect)}>
        <Stack>
          <TextInput
            required
            label="LOGIN"
            placeholder="crousz@gmail.com"
           {...form.getInputProps('username')}
            radius="md"
          />
          <PasswordInput
            required
            label="MOT DE PASSE"
            placeholder="votre mot de pass"
            {...form.getInputProps('password')}
            radius="md"
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl" bg='cyan'>
            CONNECTER
          </Button>
        </Group>
      </form>
    </div>
   
 </Paper>
    </div>
<BackgroundImage src="/Documents.gif" className="h-full w-2/3 bg-no-repeat bg-cover">
 
</BackgroundImage>
    </div>
    </>
  );
}

export default Login