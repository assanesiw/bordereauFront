import {instance} from "./Api";

export const getBordereaus = () => instance.get('/bordereau').then(res => res.data);
export const getBordereau = (id) => instance.get('/bordereau/'+ id).then(res => res.data);
export const createBordereau = (data) => instance.post('/bordereau', data).then(res => res.data);
export const deleteBordereau = (id) => instance.delete('/bordereau/'+id).then(res => res.data);
export const updateBordereau = (id,data) => instance.patch('/bordereau/'+id,data).then(res => res.data);
