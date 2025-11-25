import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GasEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tarih: new Date().toISOString().split('T')[0],
    toplam_gaz: '',
    notlar: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API}/gas-entries`);
      setEntries(response.data);
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
      toplam_gaz: parseFloat(formData.toplam_gaz),
    };

    try {
      await axios.post(`${API}/gas-entries`, submitData);
      toast.success('Gaz girişi kaydedildi');
      fetchEntries();
      setDialogOpen(false);
      setFormData({ tarih: new Date().toISOString().split('T')[0], toplam_gaz: '', notlar: '' });
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`${API}/gas-entries/${id}`);
        toast.success('Kayıt silindi');
        fetchEntries();
      } catch (error) {
        toast.error('Silme işlemi başarısız');
      }
    }
  };

  const totalGaz = entries.reduce((sum, item) => sum + item.toplam_gaz, 0);

  if (loading) return <div className="text-center py-10">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gaz Girişi</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Yeni Gaz Girişi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Gaz Girişi Kaydı</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tarih</Label>
                <Input type="date" value={formData.tarih} onChange={(e) => setFormData({ ...formData, tarih: e.target.value })} required />
              </div>
              <div>
                <Label>Toplam Gaz (kg)</Label>
                <Input type="number" step="0.01" value={formData.toplam_gaz} onChange={(e) => setFormData({ ...formData, toplam_gaz: e.target.value })} required />
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
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Toplam Gaz Girişi</p>
          <p className="text-3xl font-bold">{totalGaz.toFixed(2)} kg</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Toplam Gaz (kg)</TableHead>
                <TableHead>Notlar</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tarih}</TableCell>
                  <TableCell className="font-bold">{item.toplam_gaz.toFixed(2)} kg</TableCell>
                  <TableCell>{item.notlar || '-'}</TableCell>
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
