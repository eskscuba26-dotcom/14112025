import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Renk seçenekleri
const COLOR_OPTIONS = [
  "Beyaz",
  "Siyah",
  "Kırmızı",
  "Mavi",
  "Yeşil",
  "Sarı",
  "Turuncu",
  "Mor",
  "Kahverengi",
  "Gri",
  "Pembe",
  "Lacivert",
  "Turkuaz",
  "Bordo",
  "Krem",
];

// Ürün tipi seçenekleri
const PRODUCT_TYPES = ["Normal Ürün (Metre)", "Özel Ürün", "Standart"];

export default function ShipmentPage() {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    customer: "",
    product_type: "Normal Ürün (Metre)",
    color: "Beyaz",
    thickness: "",
    width: "",
    length: "",
    quantity: 1,
    square_meter: 0,
    waybill_no: "",
    plate: "",
    driver: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    // Search filter
    if (searchTerm) {
      const filtered = shipments.filter(
        (ship) =>
          ship.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ship.waybill_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ship.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ship.color?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredShipments(filtered);
    } else {
      setFilteredShipments(shipments);
    }
  }, [searchTerm, shipments]);

  const fetchShipments = async () => {
    try {
      const response = await axios.get(`${API}/shipments`);
      setShipments(response.data);
      setFilteredShipments(response.data);
    } catch (error) {
      console.error("Sevkiyatlar yüklenirken hata:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate square meter
      if (["thickness", "width", "length", "quantity"].includes(field)) {
        const width = parseFloat(updated.width) || 0;
        const length = parseFloat(updated.length) || 0;
        const quantity = parseInt(updated.quantity) || 0;
        updated.square_meter = ((width / 100) * length * quantity).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingShipment) {
        // Update
        await axios.put(`${API}/shipments/${editingShipment.id}`, formData);
      } else {
        // Create
        await axios.post(`${API}/shipments`, formData);
      }

      fetchShipments();
      handleCloseDialog();
    } catch (error) {
      console.error("Sevkiyat kaydedilirken hata:", error);
      alert("Bir hata oluştu!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu sevkiyatı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axios.delete(`${API}/shipments/${id}`);
      fetchShipments();
    } catch (error) {
      console.error("Sevkiyat silinirken hata:", error);
      alert("Silme işlemi başarısız!");
    }
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData({
      date: shipment.date,
      customer: shipment.customer,
      product_type: shipment.product_type,
      color: shipment.color || "Beyaz",
      thickness: shipment.thickness,
      width: shipment.width,
      length: shipment.length,
      quantity: shipment.quantity,
      square_meter: shipment.square_meter,
      waybill_no: shipment.waybill_no || "",
      plate: shipment.plate || "",
      driver: shipment.driver || "",
      description: shipment.description || "",
      notes: shipment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingShipment(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      customer: "",
      product_type: "Normal Ürün (Metre)",
      color: "Beyaz",
      thickness: "",
      width: "",
      length: "",
      quantity: 1,
      square_meter: 0,
      waybill_no: "",
      plate: "",
      driver: "",
      description: "",
      notes: "",
    });
  };

  const totalShipments = filteredShipments.length;
  const totalSquareMeter = filteredShipments
    .reduce((sum, ship) => sum + parseFloat(ship.square_meter || 0), 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sevkiyat Yönetimi</h1>
          <p className="text-slate-400">Sevkiyat kayıtlarını yönetin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-900/30 backdrop-blur border border-blue-800 rounded-lg p-6">
            <div className="text-sm text-blue-400 mb-1">Toplam Sevkiyat</div>
            <div className="text-3xl font-bold">{totalShipments} Adet</div>
          </div>
          <div className="bg-green-900/30 backdrop-blur border border-green-800 rounded-lg p-6">
            <div className="text-sm text-green-400 mb-1">Toplam Metrekare</div>
            <div className="text-3xl font-bold">{totalSquareMeter} m²</div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Müşteri, irsaliye no veya sürücü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="add-shipment-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Kayıt
          </Button>
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tarih</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Müşteri</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tip</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Renk</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Kalınlık</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">En</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Boy/Metre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Adet</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">m²</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">İrsaliye No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Plaka</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sürücü</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="px-4 py-8 text-center text-slate-400">
                      Henüz sevkiyat kaydı yok
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-t border-slate-700 hover:bg-slate-700/50"
                      data-testid={`shipment-row-${shipment.id}`}
                    >
                      <td className="px-4 py-3 text-sm">{shipment.date}</td>
                      <td className="px-4 py-3 text-sm font-medium">{shipment.customer}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs">
                          {shipment.product_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs font-semibold">
                          {shipment.color}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{shipment.thickness}</td>
                      <td className="px-4 py-3 text-sm">{shipment.width}</td>
                      <td className="px-4 py-3 text-sm">{shipment.length}</td>
                      <td className="px-4 py-3 text-sm">{shipment.quantity}</td>
                      <td className="px-4 py-3 text-sm text-green-400 font-semibold">
                        {shipment.square_meter} m²
                      </td>
                      <td className="px-4 py-3 text-sm">{shipment.waybill_no || "-"}</td>
                      <td className="px-4 py-3 text-sm">{shipment.plate || "-"}</td>
                      <td className="px-4 py-3 text-sm">{shipment.driver || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(shipment)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                            data-testid={`edit-shipment-${shipment.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(shipment.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                            data-testid={`delete-shipment-${shipment.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dialog Form */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingShipment ? "Sevkiyat Düzenle" : "Yeni Sevkiyat Kaydı"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Sevkiyat Tarihi</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer">Müşteri Adı</Label>
                  <Input
                    id="customer"
                    type="text"
                    value={formData.customer}
                    onChange={(e) => handleInputChange("customer", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Müşteri adı"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_type">Ürün Tipi</Label>
                  <Select
                    value={formData.product_type}
                    onValueChange={(value) => handleInputChange("product_type", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Renk ⭐</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => handleInputChange("color", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="color-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white max-h-60">
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color} value={color} data-testid={`color-option-${color}`}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="thickness">Kalınlık (mm)</Label>
                  <Input
                    id="thickness"
                    type="text"
                    value={formData.thickness}
                    onChange={(e) => handleInputChange("thickness", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="2 mm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="width">En (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => handleInputChange("width", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="100 cm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="length">Metre (m)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => handleInputChange("length", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="300 m"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Adet</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="square_meter">Metrekare (m²)</Label>
                  <Input
                    id="square_meter"
                    type="number"
                    step="0.01"
                    value={formData.square_meter}
                    readOnly
                    className="bg-slate-600 border-slate-500 text-green-400 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="waybill_no">İrsaliye No</Label>
                  <Input
                    id="waybill_no"
                    type="text"
                    value={formData.waybill_no}
                    onChange={(e) => handleInputChange("waybill_no", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Opsiyonel"
                  />
                </div>

                <div>
                  <Label htmlFor="plate">Plaka</Label>
                  <Input
                    id="plate"
                    type="text"
                    value={formData.plate}
                    onChange={(e) => handleInputChange("plate", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Opsiyonel"
                  />
                </div>

                <div>
                  <Label htmlFor="driver">Sürücü</Label>
                  <Input
                    id="driver"
                    type="text"
                    value={formData.driver}
                    onChange={(e) => handleInputChange("driver", e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Opsiyonel"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Ürün Açıklaması</Label>
                <Input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-slate-700 border-slate-600"
                  placeholder="Opsiyonel"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notlar</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opsiyonel notlar..."
                  rows="3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="submit-shipment-btn"
                >
                  {editingShipment ? "Güncelle" : "Kaydet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
