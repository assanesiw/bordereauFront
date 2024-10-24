import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./Login"
import { MantineProvider } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "react-query"

import Bordereau from "./Bordereau"
import AuthProvider from 'react-auth-kit';
import createStore from "react-auth-kit/createStore"
import AuthOutlet from "@auth-kit/react-router/AuthOutlet"

const store= createStore({
  authName: "assane"
})

const qc = new QueryClient

function App() {


  return (
    <AuthProvider store={store}>
    <QueryClientProvider client={qc}>
    <MantineProvider>
   <BrowserRouter>
   <Routes>
    <Route path="" element={<Login/>} />
    <Route path="login" element={<Login/>}/>
    <Route element={<AuthOutlet fallbackPath="login"/>}>
    <Route path="bordereau/*" element={<Bordereau/>}/>
    </Route>
   </Routes>
   </BrowserRouter>
   </MantineProvider>
   </QueryClientProvider>
   </AuthProvider>
   
  )
}

export default App
