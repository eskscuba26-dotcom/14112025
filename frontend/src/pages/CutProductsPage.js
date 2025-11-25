import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CutProductsPage() {
  const [cutProducts, setCutProducts] = useState([]);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    ana_urun_id: '',
    kalinlik: '',
    en: '',
    boy: '',
    adet: '',
    kullanilan: '',
    tarih: new Date().toISOString().split('T')[0],
    durum: 'Onaylı',
    renk: '', // RENK EKLEME!
    notlar: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cutRes, prodRes] = await Promise.all([
        axios.get(`${API}/cut-products`),
        axios.get(`${API}/production`),
      ]);
      setCutProducts(cutRes.data);
      setProductions(prodRes.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrekare = () => {
    const { kalinlik, en, boy, adet } = formData;
    if (kalinlik && en && boy && adet) {
      return ((parseFloat(kalinlik) * parseFloat(en) * parseFloat(boy) * parseInt(adet)) / 10000).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      kalinlik: parseFloat(formData.kalinlik),
      en: parseFloat(formData.en),
      boy: parseFloat(formData.boy),
      adet: parseInt(formData.adet),
      kullanilan: parseInt(formData.kullanilan),
      metrekare: parseFloat(calculateMetrekare()),
      boyut: `${formData.kalinlik}x${formData.en}x${formData.boy}`,
    };

    try {
      if (editMode) {
        await axios.put(`${API}/cut-products/${currentId}`, submitData);
        toast.success('Kayıt güncellendi');
      } else {
        await axios.post(`${API}/cut-products`, submitData);
        toast.success('Yeni kesim kaydı eklendi');
      }
      fetchData();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ana_urun_id: item.ana_urun_id,
      kalinlik: item.kalinlik.toString(),
      en: item.en.toString(),
      boy: item.boy.toString(),
      adet: item.adet.toString(),
      kullanilan: item.kullanilan.toString(),
      tarih: item.tarih,
      durum: item.durum,
      renk: item.renk || '', // RENK
      notlar: item.notlar || '',
    });
    setCurrentId(item.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`${API}/cut-products/${id}`);
        toast.success('Kayıt silindi');
        fetchData();
      } catch (error) {
        toast.error('Silme işlemi başarısız');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      ana_urun_id: '',
      kalinlik: '',
      en: '',
      boy: '',
      adet: '',
      kullanilan: '',
      tarih: new Date().toISOString().split('T')[0],
      durum: 'Onaylı',
      renk: '',
      notlar: '',
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const filteredCutProducts = cutProducts.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.boyut?.toLowerCase().includes(search) ||
      item.durum?.toLowerCase().includes(search) ||
      item.renk?.toLowerCase().includes(search) // RENK ARAMA
    );
  });

  const totalKesim = filteredCutProducts.length;
  const totalAdet = filteredCutProducts.reduce((sum, item) => sum + item.adet, 0);
  const totalMetrekare = filteredCutProducts.reduce((sum, item) => sum + item.metrekare, 0);

  if (loading) {
    return <div className=\"text-center py-10\">Yükleniyor...</div>;
  }

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <h1 className=\"text-3xl font-bold\">Kesilmiş Ürün</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>Yeni Kesim</Button>
          </DialogTrigger>
          <DialogContent className=\"max-w-2xl max-h-[90vh] overflow-y-auto\">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Kesim Düzenle' : 'Yeni Kesim Kaydı'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className=\"space-y-4\">
              <div>
                <Label>Ana Ürün Seç</Label>
                <Select
                  value={formData.ana_urun_id}
                  onValueChange={(value) => {
                    const prod = productions.find((p) => p.id === value);
                    setFormData({
                      ...formData,
                      ana_urun_id: value,
                      kalinlik: prod?.kalinlik.toString() || '',
                      en: prod?.en.toString() || '',
                      boy: prod?.boy.toString() || '',
                      renk: prod?.renk || '', // Ana üründen rengi al
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=\"Ana ürün seçiniz\" />
                  </SelectTrigger>
                  <SelectContent>
                    {productions.map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.kalinlik}x{prod.en}x{prod.boy} - {prod.makine} ({prod.adet} adet)
                        {prod.renk && ` - ${prod.renk}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className=\"grid grid-cols-3 gap-4\">
                <div>
                  <Label>Kalınlık (mm)</Label>
                  <Input
                    type=\"number\"
                    step=\"0.01\"
                    value={formData.kalinlik}
                    onChange={(e) => setFormData({ ...formData, kalinlik: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>En (cm)</Label>
                  <Input
                    type=\"number\"
                    step=\"0.01\"
                    value={formData.en}
                    onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Boy (cm)</Label>
                  <Input
                    type=\"number\"
                    step=\"0.01\"
                    value={formData.boy}
                    onChange={(e) => setFormData({ ...formData, boy: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className=\"grid grid-cols-3 gap-4\">
                <div>
                  <Label>İhtiyaç (Adet)</Label>
                  <Input
                    type=\"number\"
                    value={formData.adet}
                    onChange={(e) => setFormData({ ...formData, adet: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Kullanılan (Adet)</Label>
                  <Input
                    type=\"number\"
                    value={formData.kullanilan}
                    onChange={(e) => setFormData({ ...formData, kullanilan: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>m² (Otomatik)</Label>
                  <Input value={calculateMetrekare()} disabled />
                </div>
              </div>

              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <Label>Kesim Tarihi</Label>
                  <Input
                    type=\"date\"
                    value={formData.tarih}
                    onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Kalite Durumu</Label>
                  <Select
                    value={formData.durum}
                    onValueChange={(value) => setFormData({ ...formData, durum: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"Onaylı\">Onaylı</SelectItem>
                      <SelectItem value=\"Beklemede\">Beklemede</SelectItem>
                      <SelectItem value=\"Reddedildi\">Reddedildi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* RENK EKLEME - YENİ! */}
              <div>
                <Label>Renk (Opsiyonel)</Label>
                <Input
                  value={formData.renk}
                  onChange={(e) => setFormData({ ...formData, renk: e.target.value })}
                  placeholder=\"Örn: Sarı, Mavi, vb.\"
                />
              </div>

              <div>
                <Label>Notlar</Label>
                <Textarea
                  value={formData.notlar}
                  onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
                  rows={3}
                />
              </div>

              <div className=\"flex justify-end space-x-2\">
                <Button type=\"button\" variant=\"outline\" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type=\"submit\">{editMode ? 'Güncelle' : 'Kaydet'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className=\"grid grid-cols-3 gap-4\">
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm\">Toplam Kesim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=\"text-2xl font-bold\">{totalKesim}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm\">Toplam Adet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=\"text-2xl font-bold\">{totalAdet}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm\">Toplam m²</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=\"text-2xl font-bold\">{totalMetrekare.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder=\"Ara (Boyut, Durum, Renk)...\"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className=\"p-0\">
          <div className=\"overflow-x-auto\">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boyut</TableHead>
                  <TableHead>Adet</TableHead>
                  <TableHead>m²</TableHead>
                  <TableHead>Ana Ürün</TableHead>
                  <TableHead>Kullanılan</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Renk</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCutProducts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.boyut}</TableCell>
                    <TableCell>{item.adet}</TableCell>
                    <TableCell>{item.metrekare.toFixed(2)}</TableCell>
                    <TableCell>{item.ana_urun_id.substring(0, 8)}...</TableCell>
                    <TableCell>{item.kullanilan}</TableCell>
                    <TableCell>{item.tarih}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.durum === 'Onaylı'
                            ? 'bg-green-100 text-green-800'
                            : item.durum === 'Beklemede'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.durum}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.renk && (
                        <span className=\"px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium\">
                          {item.renk}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className=\"flex space-x-2\">
                        <Button size=\"sm\" variant=\"outline\" onClick={() => handleEdit(item)}>
                          Düzenle
                        </Button>
                        <Button
                          size=\"sm\"
                          variant=\"destructive\"
                          onClick={() => handleDelete(item.id)}
                        >
                          Sil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
