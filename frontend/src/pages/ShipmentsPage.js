import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    sevkiyat_tarihi: new Date().toISOString().split('T')[0],
    musteri_adi: '',
    urun_tipi: 'Normal Urun (Metre)',
    kalinlik: '',
    en: '',
    metre: '',
    boy: '',
    adet: '',
    irsaliye_no: '',
    plaka: '',
    surucu: '',
    urun_aciklamasi: '',
    renk: '',
    notlar: '',
  });

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await axios.get(`${API}/shipments`);
      setShipments(response.data);
    } catch (error) {
      toast.error('Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrekare = () => {
    const { kalinlik, en, metre, boy, adet, urun_tipi } = formData;
    if (urun_tipi === 'Normal Urun (Metre)') {
      if (kalinlik && en && metre && adet) {
        return ((parseFloat(kalinlik) * parseFloat(en) * parseFloat(metre) * parseInt(adet)) / 10000).toFixed(2);
      }
    } else {
      if (kalinlik && en && boy && adet) {
        return ((parseFloat(kalinlik) * parseFloat(en) * parseFloat(boy) * parseInt(adet)) / 10000).toFixed(2);
      }
    }
    return '0.00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      kalinlik: parseFloat(formData.kalinlik),
      en: parseFloat(formData.en),
      metre: formData.urun_tipi === 'Normal Urun (Metre)' ? parseFloat(formData.metre) : null,
      boy: formData.urun_tipi === 'Kesim' ? parseFloat(formData.boy) : null,
      adet: parseInt(formData.adet),
      metrekare: parseFloat(calculateMetrekare()),
    };

    try {
      if (editMode) {
        await axios.put(`${API}/shipments/${currentId}`, submitData);
        toast.success('Kayit guncellendi');
      } else {
        await axios.post(`${API}/shipments`, submitData);
        toast.success('Yeni sevkiyat kaydi eklendi');
      }
      fetchShipments();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Islem basarisiz');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      sevkiyat_tarihi: item.sevkiyat_tarihi,
      musteri_adi: item.musteri_adi,
      urun_tipi: item.urun_tipi,
      kalinlik: item.kalinlik.toString(),
      en: item.en.toString(),
      metre: item.metre?.toString() || '',
      boy: item.boy?.toString() || '',
      adet: item.adet.toString(),
      irsaliye_no: item.irsaliye_no || '',
      plaka: item.plaka || '',
      surucu: item.surucu || '',
      urun_aciklamasi: item.urun_aciklamasi || '',
      renk: item.renk || '',
      notlar: item.notlar || '',
    });
    setCurrentId(item.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kaydi silmek istediginizden emin misiniz?')) {
      try {
        await axios.delete(`${API}/shipments/${id}`);
        toast.success('Kayit silindi');
        fetchShipments();
      } catch (error) {
        toast.error('Silme islemi basarisiz');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      sevkiyat_tarihi: new Date().toISOString().split('T')[0],
      musteri_adi: '',
      urun_tipi: 'Normal Urun (Metre)',
      kalinlik: '',
      en: '',
      metre: '',
      boy: '',
      adet: '',
      irsaliye_no: '',
      plaka: '',
      surucu: '',
      urun_aciklamasi: '',
      renk: '',
      notlar: '',
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const filteredShipments = shipments.filter((item) => {
    const search = searchTerm.toLowerCase();
    return item.musteri_adi?.toLowerCase().includes(search) || item.irsaliye_no?.toLowerCase().includes(search) || item.plaka?.toLowerCase().includes(search) || item.renk?.toLowerCase().includes(search);
  });

  const totalSevkiyat = filteredShipments.length;
  const totalAdet = filteredShipments.reduce((sum, item) => sum + item.adet, 0);
  const totalMetrekare = filteredShipments.reduce((sum, item) => sum + item.metrekare, 0);

  if (loading) return <div className="text-center py-10">Yukleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sevkiyat</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button>Yeni Sevkiyat</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editMode ? 'Sevkiyat Duzenle' : 'Yeni Sevkiyat Kaydi'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Sevkiyat Tarihi</Label><Input type="date" value={formData.sevkiyat_tarihi} onChange={(e) => setFormData({ ...formData, sevkiyat_tarihi: e.target.value })} required /></div>
                <div><Label>Musteri Adi</Label><Input value={formData.musteri_adi} onChange={(e) => setFormData({ ...formData, musteri_adi: e.target.value })} required /></div>
              </div>
              <div><Label>Urun Tipi</Label><Select value={formData.urun_tipi} onValueChange={(value) => setFormData({ ...formData, urun_tipi: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Normal Urun (Metre)">Normal Urun (Metre)</SelectItem><SelectItem value="Kesim">Kesim</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Kalinlik (mm)</Label><Input type="number" step="0.01" value={formData.kalinlik} onChange={(e) => setFormData({ ...formData, kalinlik: e.target.value })} required /></div>
                <div><Label>En (cm)</Label><Input type="number" step="0.01" value={formData.en} onChange={(e) => setFormData({ ...formData, en: e.target.value })} required /></div>
              </div>
              {formData.urun_tipi === 'Normal Urun (Metre)' ? (
                <div><Label>Metre (m)</Label><Input type="number" step="0.01" value={formData.metre} onChange={(e) => setFormData({ ...formData, metre: e.target.value })} required /></div>
              ) : (
                <div><Label>Boy (cm)</Label><Input type="number" step="0.01" value={formData.boy} onChange={(e) => setFormData({ ...formData, boy: e.target.value })} required /></div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Adet</Label><Input type="number" value={formData.adet} onChange={(e) => setFormData({ ...formData, adet: e.target.value })} required /></div>
                <div><Label>Metrekare (Otomatik)</Label><Input value={calculateMetrekare()} disabled /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Irsaliye No</Label><Input value={formData.irsaliye_no} onChange={(e) => setFormData({ ...formData, irsaliye_no: e.target.value })} /></div>
                <div><Label>Plaka</Label><Input value={formData.plaka} onChange={(e) => setFormData({ ...formData, plaka: e.target.value })} /></div>
                <div><Label>Surucu</Label><Input value={formData.surucu} onChange={(e) => setFormData({ ...formData, surucu: e.target.value })} /></div>
              </div>
              <div><Label>Urun Aciklamasi</Label><Input value={formData.urun_aciklamasi} onChange={(e) => setFormData({ ...formData, urun_aciklamasi: e.target.value })} /></div>
              <div><Label>Renk (Opsiyonel)</Label><Input value={formData.renk} onChange={(e) => setFormData({ ...formData, renk: e.target.value })} placeholder="Orn: Sari, Mavi, vb." /></div>
              <div><Label>Notlar</Label><Textarea value={formData.notlar} onChange={(e) => setFormData({ ...formData, notlar: e.target.value })} rows={3} /></div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Iptal</Button>
                <Button type="submit">{editMode ? 'Guncelle' : 'Kaydet'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Toplam Sevkiyat</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalSevkiyat}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Toplam Adet</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalAdet}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Toplam m2</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalMetrekare.toFixed(2)}</p></CardContent></Card>
      </div>
      <div><Input placeholder="Ara (Musteri, Irsaliye No, Plaka, Renk)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Tarih</TableHead><TableHead>Musteri</TableHead><TableHead>Tip</TableHead><TableHead>Kalinlik</TableHead><TableHead>En</TableHead><TableHead>Metre/Boy</TableHead><TableHead>Adet</TableHead><TableHead>m2</TableHead><TableHead>Irsaliye No</TableHead><TableHead>Plaka</TableHead><TableHead>Renk</TableHead><TableHead>Islemler</TableHead></TableRow></TableHeader><TableBody>{filteredShipments.map((item) => (<TableRow key={item.id}><TableCell>{item.sevkiyat_tarihi}</TableCell><TableCell>{item.musteri_adi}</TableCell><TableCell><span className="text-xs">{item.urun_tipi}</span></TableCell><TableCell>{item.kalinlik}</TableCell><TableCell>{item.en}</TableCell><TableCell>{item.metre || item.boy || '-'}</TableCell><TableCell>{item.adet}</TableCell><TableCell>{item.metrekare.toFixed(2)}</TableCell><TableCell>{item.irsaliye_no || '-'}</TableCell><TableCell>{item.plaka || '-'}</TableCell><TableCell>{item.renk && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">{item.renk}</span>}</TableCell><TableCell><div className="flex space-x-2"><Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Duzenle</Button><Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Sil</Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
    </div>
  );
}
