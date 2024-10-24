import { instance } from "./Api";

export const getUsers = () => instance.get('/user').then(res => res.data);
export const getUser = (id) => instance.get('/user/'+ id).then(res => res.data);
export const createUser = (data) => instance.post('/user',data).then(res => res.data);
export const createlogin = (data) => instance.post('/user/login',data).then(res => res.data);
export const deleteUser = (id) => instance.delete('/user/'+ id).then(res => res.data);
export const updateUser = (id,data) => instance.patch('/user/'+id,data).then(res => res.data); 
export const Updatepassword = (id,data) => instance.patch('/user/updatepassword/'+id,data).then(res => res.data); 
 