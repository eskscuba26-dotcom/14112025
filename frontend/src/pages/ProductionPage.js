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

export default function ProductionPage() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    tarih: new Date().toISOString().split('T')[0],
    makine: 'MAKİNE 1',
    kalinlik: '',
    en: '',
    boy: '',
    adet: '',
    masura: '',
    m_adet: '',
    model: '',
    gaz_agirligi: '',
    renk: '',
    notlar: '',
  });

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const response = await axios.get(`${API}/production`);
      setProductions(response.data);
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

  const calculateGazAgirligi = () => {
    const { kalinlik, en, boy, adet } = formData;
    if (kalinlik && en && boy && adet) {
      // Formula: (Kalınlık * En * Boy * Adet * 0.92) / 1000000
      return (
        (parseFloat(kalinlik) * parseFloat(en) * parseFloat(boy) * parseInt(adet) * 0.92) /
        1000000
      ).toFixed(2);
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
      metrekare: parseFloat(calculateMetrekare()),
      masura: formData.masura ? parseInt(formData.masura) : null,
      m_adet: formData.m_adet ? parseInt(formData.m_adet) : null,
      gaz_agirligi: parseFloat(calculateGazAgirligi()),
    };

    try {
      if (editMode) {
        await axios.put(`${API}/production/${currentId}`, submitData);
        toast.success('Kayıt güncellendi');
      } else {
        await axios.post(`${API}/production`, submitData);
        toast.success('Yeni kayıt eklendi');
      }
      fetchProductions();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      tarih: item.tarih,
      makine: item.makine,
      kalinlik: item.kalinlik.toString(),
      en: item.en.toString(),
      boy: item.boy.toString(),
      adet: item.adet.toString(),
      masura: item.masura?.toString() || '',
      m_adet: item.m_adet?.toString() || '',
      model: item.model || '',
      gaz_agirligi: item.gaz_agirligi.toString(),
      renk: item.renk || '',
      notlar: item.notlar || '',
    });
    setCurrentId(item.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`${API}/production/${id}`);
        toast.success('Kayıt silindi');
        fetchProductions();
      } catch (error) {
        toast.error('Silme işlemi başarısız');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tarih: new Date().toISOString().split('T')[0],
      makine: 'MAKİNE 1',
      kalinlik: '',
      en: '',
      boy: '',
      adet: '',
      masura: '',
      m_adet: '',
      model: '',
      gaz_agirligi: '',
      renk: '',
      notlar: '',
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const filteredProductions = productions.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.makine?.toLowerCase().includes(search) ||
      item.model?.toLowerCase().includes(search) ||
      item.renk?.toLowerCase().includes(search)
    );
  });

  const totalAdet = filteredProductions.reduce((sum, item) => sum + item.adet, 0);
  const totalMetrekare = filteredProductions.reduce((sum, item) => sum + item.metrekare, 0);
  const totalGaz = filteredProductions.reduce((sum, item) => sum + item.gaz_agirligi, 0);

  if (loading) {
    return <div className=\"text-center py-10\">Yükleniyor...</div>;
  }

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <h1 className=\"text-3xl font-bold\">Üretim Girişi</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>Yeni Kayıt</Button>
          </DialogTrigger>
          <DialogContent className=\"max-w-2xl max-h-[90vh] overflow-y-auto\">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Kayıt Düzenle' : 'Yeni Üretim Kaydı'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className=\"space-y-4\">
              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <Label>Tarih</Label>
                  <Input
                    type=\"date\"
                    value={formData.tarih}
                    onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Makine</Label>
                  <Select
                    value={formData.makine}
                    onValueChange={(value) => setFormData({ ...formData, makine: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"MAKİNE 1\">MAKİNE 1</SelectItem>
                      <SelectItem value=\"MAKİNE 2\">MAKİNE 2</SelectItem>
                      <SelectItem value=\"MAKİNE 3\">MAKİNE 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Label>Adet</Label>
                  <Input
                    type=\"number\"
                    value={formData.adet}
                    onChange={(e) => setFormData({ ...formData, adet: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>m² (Otomatik)</Label>
                  <Input value={calculateMetrekare()} disabled />
                </div>
                <div>
                  <Label>Gaz Ağırlığı (kg)</Label>
                  <Input value={calculateGazAgirligi()} disabled />
                </div>
              </div>

              <div className=\"grid grid-cols-3 gap-4\">
                <div>
                  <Label>Masura</Label>
                  <Input
                    type=\"number\"
                    value={formData.masura}
                    onChange={(e) => setFormData({ ...formData, masura: e.target.value })}
                  />
                </div>
                <div>
                  <Label>M.Adet</Label>
                  <Input
                    type=\"number\"
                    value={formData.m_adet}
                    onChange={(e) => setFormData({ ...formData, m_adet: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

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
            <CardTitle className=\"text-sm\">Toplam Üretim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=\"text-2xl font-bold\">{totalAdet} Adet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm\">Toplam Metrekare</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=\"text-2xl font-bold\">{totalMetrekare.toFixed(2)} m²</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm\">Toplam Gaz Ağırlığı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=\"text-2xl font-bold\">{totalGaz.toFixed(2)} kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder=\"Ara (Makine, Model, Renk)...\"
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
                  <TableHead>Tarih</TableHead>
                  <TableHead>Makine</TableHead>
                  <TableHead>Kalınlık</TableHead>
                  <TableHead>En</TableHead>
                  <TableHead>Boy</TableHead>
                  <TableHead>Adet</TableHead>
                  <TableHead>m²</TableHead>
                  <TableHead>Masura</TableHead>
                  <TableHead>M.Adet</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Gaz (kg)</TableHead>
                  <TableHead>Renk</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProductions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.tarih}</TableCell>
                    <TableCell>{item.makine}</TableCell>
                    <TableCell>{item.kalinlik}</TableCell>
                    <TableCell>{item.en}</TableCell>
                    <TableCell>{item.boy}</TableCell>
                    <TableCell>{item.adet}</TableCell>
                    <TableCell>{item.metrekare.toFixed(2)}</TableCell>
                    <TableCell>{item.masura || '-'}</TableCell>
                    <TableCell>{item.m_adet || '-'}</TableCell>
                    <TableCell>{item.model || '-'}</TableCell>
                    <TableCell>{item.gaz_agirligi.toFixed(2)}</TableCell>
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
