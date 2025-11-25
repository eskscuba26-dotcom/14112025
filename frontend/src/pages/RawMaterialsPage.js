import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    malzeme_adi: '',
    miktar: '',
    birim: 'kg',
    tedarikci: '',
    alim_tarihi: new Date().toISOString().split('T')[0],
    birim_fiyat: '',
    para_birimi: 'TRY',
    notlar: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API}/raw-materials`);
      setMaterials(response.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      miktar: parseFloat(formData.miktar),
      birim_fiyat: parseFloat(formData.birim_fiyat),
      toplam_maliyet: parseFloat(formData.miktar) * parseFloat(formData.birim_fiyat),
    };

    try {
      await axios.post(`${API}/raw-materials`, submitData);
      toast.success('Hammadde eklendi');
      fetchMaterials();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`${API}/raw-materials/${id}`);
        toast.success('Kayıt silindi');
        fetchMaterials();
      } catch (error) {
        toast.error('Silme işlemi başarısız');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      malzeme_adi: '',
      miktar: '',
      birim: 'kg',
      tedarikci: '',
      alim_tarihi: new Date().toISOString().split('T')[0],
      birim_fiyat: '',
      para_birimi: 'TRY',
      notlar: '',
    });
  };

  if (loading) return <div className="text-center py-10">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hammadde Yönetimi</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Yeni Hammadde</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Hammadde Kaydı</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Malzeme Adı</Label>
                <Input value={formData.malzeme_adi} onChange={(e) => setFormData({ ...formData, malzeme_adi: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Miktar</Label>
                  <Input type="number" step="0.01" value={formData.miktar} onChange={(e) => setFormData({ ...formData, miktar: e.target.value })} required />
                </div>
                <div>
                  <Label>Birim</Label>
                  <Select value={formData.birim} onValueChange={(value) => setFormData({ ...formData, birim: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="adet">adet</SelectItem>
                      <SelectItem value="ton">ton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tedarikçi</Label>
                  <Input value={formData.tedarikci} onChange={(e) => setFormData({ ...formData, tedarikci: e.target.value })} />
                </div>
                <div>
                  <Label>Alım Tarihi</Label>
                  <Input type="date" value={formData.alim_tarihi} onChange={(e) => setFormData({ ...formData, alim_tarihi: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Birim Fiyat</Label>
                  <Input type="number" step="0.01" value={formData.birim_fiyat} onChange={(e) => setFormData({ ...formData, birim_fiyat: e.target.value })} required />
                </div>
                <div>
                  <Label>Para Birimi</Label>
                  <Select value={formData.para_birimi} onValueChange={(value) => setFormData({ ...formData, para_birimi: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notlar</Label>
                <Textarea value={formData.notlar} onChange={(e) => setFormData({ ...formData, notlar: e.target.value })} rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Malzeme Adı</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Tedarikçi</TableHead>
                <TableHead>Alım Tarihi</TableHead>
                <TableHead>Birim Fiyat</TableHead>
                <TableHead>Toplam Maliyet</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.malzeme_adi}</TableCell>
                  <TableCell>{item.miktar} {item.birim}</TableCell>
                  <TableCell>{item.tedarikci || '-'}</TableCell>
                  <TableCell>{item.alim_tarihi}</TableCell>
                  <TableCell>{item.birim_fiyat.toFixed(2)} {item.para_birimi}</TableCell>
                  <TableCell className="font-bold">{item.toplam_maliyet.toFixed(2)} {item.para_birimi}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Sil</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
