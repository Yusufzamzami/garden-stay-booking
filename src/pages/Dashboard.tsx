import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, DollarSign, Users, Bed, ArrowLeft, Download, FileText, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    availableRooms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    description: '',
    price_per_night: 0,
    capacity: 0,
    amenities: '',
  });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`*, rooms (name, type)`)
        .order('created_at', { ascending: false });
      if (bookingsError) throw bookingsError;

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('type', { ascending: true });
      if (roomsError) throw roomsError;

      setBookings(bookingsData || []);
      setRooms(roomsData || []);

      const totalBookings = bookingsData?.length || 0;
      const totalRevenue =
        bookingsData?.reduce(
          (sum, booking) => sum + parseFloat(booking.total_price.toString()),
          0
        ) || 0;

      const availableRooms = roomsData?.filter((room) => room.is_available).length || 0;
      const occupancyRate = roomsData?.length
        ? ((roomsData.length - availableRooms) / roomsData.length) * 100
        : 0;

      setStats({ totalBookings, totalRevenue, occupancyRate, availableRooms });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', bookingId);
      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const toggleRoomAvailability = async (roomId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase.from('rooms').update({ is_available: !isAvailable }).eq('id', roomId);
      if (error) throw error;
      toast.success(`Status kamar berhasil ${!isAvailable ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating room availability:', error);
      toast.error('Gagal mengubah status kamar');
    }
  };

  const openEditDialog = (room: any) => {
    setEditingRoom(room);
    setEditForm({
      name: room.name,
      type: room.type,
      description: room.description || '',
      price_per_night: room.price_per_night,
      capacity: room.capacity,
      amenities: room.amenities?.join(', ') || '',
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingRoom(null);
    setEditForm({
      name: '',
      type: '',
      description: '',
      price_per_night: 0,
      capacity: 0,
      amenities: '',
    });
  };

  const saveRoomChanges = async () => {
    if (!editingRoom) return;
    
    try {
      const amenitiesArray = editForm.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const { error } = await supabase
        .from('rooms')
        .update({
          name: editForm.name,
          type: editForm.type,
          description: editForm.description,
          price_per_night: editForm.price_per_night,
          capacity: editForm.capacity,
          amenities: amenitiesArray,
        })
        .eq('id', editingRoom.id);

      if (error) throw error;
      
      toast.success('Data kamar berhasil diperbarui!');
      closeEditDialog();
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Gagal memperbarui data kamar');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
      if (error) throw error;
      toast.success('Booking berhasil dihapus');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Gagal menghapus booking');
    }
  };

  const exportFinancialReportCSV = () => {
    try {
      const headers = [
        'No',
        'Tanggal Booking',
        'Nama Tamu',
        'Email',
        'Telepon',
        'Tipe Kamar',
        'Nama Kamar',
        'Check-in',
        'Check-out',
        'Jumlah Malam',
        'Jumlah Tamu',
        'Harga per Malam',
        'Total Harga',
        'Metode Pembayaran',
        'Status Pembayaran',
        'Status Booking',
        'Permintaan Khusus'
      ];

      const rows = bookings.map((b, index) => {
        const checkIn = new Date(b.check_in_date);
        const checkOut = new Date(b.check_out_date);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerNight = parseFloat(b.total_price.toString()) / nights;

        return [
          (index + 1).toString(),
          new Date(b.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          b.guest_name,
          b.guest_email,
          b.guest_phone,
          b.rooms?.type || '-',
          b.rooms?.name || '-',
          checkIn.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          checkOut.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          nights.toString(),
          b.guests_count.toString(),
          `Rp ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(pricePerNight)}`,
          `Rp ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(b.total_price)}`,
          b.payment_method || '-',
          b.payment_status === 'pending' ? 'Pending' : b.payment_status === 'paid' ? 'Lunas' : 'Dibatalkan',
          b.booking_status === 'confirmed' ? 'Dikonfirmasi' : 'Dibatalkan',
          b.special_requests || '-'
        ];
      });

      // Add summary row
      const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price.toString()), 0);
      const summaryRow = [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'TOTAL:',
        '',
        `Rp ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalRevenue)}`,
        '',
        '',
        '',
        ''
      ];

      const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
        '',
        summaryRow.map((c) => `"${c}"`).join(',')
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `Laporan_Keuangan_${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Laporan CSV berhasil diexport!');
    } catch (error) {
      console.error('Error exporting CSV report:', error);
      toast.error('Gagal mengexport laporan CSV');
    }
  };

  const exportFinancialReportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('THE GARDEN RESIDENCE', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('LAPORAN KEUANGAN', pageWidth / 2, 28, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const reportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Tanggal Laporan: ${reportDate}`, pageWidth / 2, 35, { align: 'center' });

      // Summary Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RINGKASAN KEUANGAN', 14, 45);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryData = [
        ['Total Booking', `: ${stats.totalBookings}`],
        ['Total Pendapatan', `: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalRevenue)}`],
        ['Tingkat Okupansi', `: ${stats.occupancyRate.toFixed(1)}%`],
        ['Kamar Tersedia', `: ${stats.availableRooms}`],
      ];

      let yPos = 52;
      summaryData.forEach(([label, value]) => {
        doc.text(label, 14, yPos);
        doc.text(value, 60, yPos);
        yPos += 6;
      });

      // Table
      const tableData = bookings.map((b) => [
        new Date(b.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        b.guest_name,
        b.rooms?.name || '-',
        `${new Date(b.check_in_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} - ${new Date(b.check_out_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}`,
        b.guests_count.toString(),
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.total_price),
        b.booking_status === 'confirmed' ? 'Confirmed' : 'Cancelled',
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Tanggal', 'Nama Tamu', 'Kamar', 'Periode', 'Tamu', 'Total', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 25 },
          1: { halign: 'left', cellWidth: 35 },
          2: { halign: 'left', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 30 },
          4: { halign: 'center', cellWidth: 15 },
          5: { halign: 'right', cellWidth: 35 },
          6: { halign: 'center', cellWidth: 22 },
        },
        didDrawPage: (data) => {
          // Footer
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text(
            `Halaman ${data.pageNumber} dari ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        },
      });

      doc.save(`Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Laporan PDF berhasil diexport!');
    } catch (error) {
      console.error('Error exporting PDF report:', error);
      toast.error('Gagal mengexport laporan PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')} 
              className="text-muted-foreground hover:text-foreground -ml-2 sm:ml-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">The Garden Residence</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-base sm:text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Occupancy Rate</CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Available Rooms</CardTitle>
              <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.availableRooms}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile Optimized */}
        <Tabs defaultValue="bookings" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="bookings" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="rooms" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Room Management
            </TabsTrigger>
          </TabsList>

          {/* BOOKINGS - Mobile Optimized */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Recent Bookings</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Kelola semua reservasi hotel</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button onClick={exportFinancialReportCSV} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                      <Download className="h-4 w-4" /> 
                      <span className="hidden sm:inline">Export CSV</span>
                      <span className="sm:hidden">CSV</span>
                    </Button>
                    <Button onClick={exportFinancialReportPDF} size="sm" className="gap-2 w-full sm:w-auto">
                      <FileText className="h-4 w-4" /> 
                      <span className="hidden sm:inline">Export PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3 p-4">
                  {bookings.map((b) => (
                    <Card key={b.id} className="p-4 hover-scale">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{b.guest_name}</div>
                            <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                          </div>
                          <Badge variant={b.booking_status === 'confirmed' ? 'default' : 'destructive'} className="text-xs">
                            {b.booking_status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Kamar:</span>
                            <div className="font-medium">{b.rooms?.name}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tamu:</span>
                            <div className="font-medium">{b.guests_count} orang</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Check-in:</span>
                            <div className="font-medium">{new Date(b.check_in_date).toLocaleDateString('id-ID')}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Check-out:</span>
                            <div className="font-medium">{new Date(b.check_out_date).toLocaleDateString('id-ID')}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Total:</span>
                            <div className="font-bold text-primary">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(b.total_price)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2 border-t">
                          {b.booking_status === 'confirmed' && (
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'cancelled')} className="flex-1 text-xs">
                              Cancel
                            </Button>
                          )}
                          {b.booking_status === 'cancelled' && (
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'confirmed')} className="flex-1 text-xs">
                              Restore
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)} className="flex-1 text-xs">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{b.guest_name}</div>
                              <div className="text-sm text-muted-foreground">{b.guest_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{b.rooms?.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(b.check_in_date).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">to {new Date(b.check_out_date).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>{b.guests_count}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(b.total_price)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={b.booking_status === 'confirmed' ? 'default' : 'destructive'}>
                              {b.booking_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {b.booking_status === 'confirmed' && (
                                <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'cancelled')}>Cancel</Button>
                              )}
                              {b.booking_status === 'cancelled' && (
                                <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'confirmed')}>Restore</Button>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)}>Delete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROOMS - Mobile Optimized */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Available Rooms</CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      Kelola ketersediaan dan harga kamar hotel
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default" className="gap-1">
                      <Bed className="h-3 w-3" />
                      {stats.availableRooms} Tersedia
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-4 p-4">
                  {rooms.map((r) => (
                    <Card key={r.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                      <div className="p-4 space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-base mb-1">{r.name}</h3>
                            <Badge variant="secondary" className="capitalize text-xs">
                              {r.type === 'deluxe' ? 'Deluxe Room' : r.type === 'standard' ? 'Standard Room' : r.type}
                            </Badge>
                          </div>
                          <Badge 
                            variant={r.is_available ? 'default' : 'destructive'} 
                            className="text-xs font-semibold shrink-0"
                          >
                            {r.is_available ? 'Tersedia' : 'Penuh'}
                          </Badge>
                        </div>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              <Users className="h-3.5 w-3.5" />
                              <span>Kapasitas</span>
                            </div>
                            <div className="font-semibold text-sm">{r.capacity} Tamu</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>Harga/Malam</span>
                            </div>
                            <div className="font-bold text-primary text-sm">
                              Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(r.price_per_night)}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {r.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 px-1">
                            {r.description}
                          </p>
                        )}

                        {/* Amenities */}
                        {r.amenities && r.amenities.length > 0 && (
                          <div className="px-1">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Fasilitas:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {r.amenities.slice(0, 4).map((amenity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs py-0.5 px-2">
                                  {amenity}
                                </Badge>
                              ))}
                              {r.amenities.length > 4 && (
                                <Badge variant="outline" className="text-xs py-0.5 px-2">
                                  +{r.amenities.length - 4} lainnya
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(r)}
                            className="font-semibold gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant={r.is_available ? "outline" : "default"}
                            onClick={() => toggleRoomAvailability(r.id, r.is_available)}
                            className="font-semibold"
                          >
                            {r.is_available ? '🔒 Nonaktifkan' : '✓ Aktifkan'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Nama Kamar</TableHead>
                        <TableHead className="font-bold">Tipe</TableHead>
                        <TableHead className="font-bold">Kapasitas</TableHead>
                        <TableHead className="font-bold">Harga/Malam</TableHead>
                        <TableHead className="font-bold">Fasilitas</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="font-bold text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-semibold">{r.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize font-medium">
                              {r.type === 'deluxe' ? 'Deluxe Room' : r.type === 'standard' ? 'Standard Room' : r.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{r.capacity} Tamu</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-primary">
                            Rp {new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(r.price_per_night)}
                          </TableCell>
                          <TableCell>
                            {r.amenities && r.amenities.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {r.amenities.slice(0, 3).map((amenity, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {r.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{r.amenities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={r.is_available ? 'default' : 'destructive'}
                              className="font-semibold"
                            >
                              {r.is_available ? 'Tersedia' : 'Penuh'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-2 justify-center">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openEditDialog(r)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={r.is_available ? "outline" : "default"}
                                onClick={() => toggleRoomAvailability(r.id, r.is_available)}
                                className="font-medium"
                              >
                                {r.is_available ? 'Nonaktifkan' : 'Aktifkan'}
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
          </TabsContent>
        </Tabs>

        {/* Edit Room Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Room Data</DialogTitle>
              <DialogDescription>
                Ubah informasi kamar sesuai kebutuhan. Klik simpan untuk menyimpan perubahan.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Kamar</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Contoh: Deluxe Garden View"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Tipe Kamar</Label>
                <select
                  id="type"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="standard">Standard Room</option>
                  <option value="deluxe">Deluxe Room</option>
                  <option value="suite">Suite Room</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Kapasitas (Tamu)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">Harga per Malam (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={editForm.price_per_night}
                    onChange={(e) => setEditForm({ ...editForm, price_per_night: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Deskripsi kamar..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amenities">Fasilitas</Label>
                <Textarea
                  id="amenities"
                  value={editForm.amenities}
                  onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })}
                  placeholder="WiFi, AC, TV, Kamar Mandi Dalam, dll (pisahkan dengan koma)"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">Pisahkan setiap fasilitas dengan koma (,)</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={closeEditDialog}>
                Batal
              </Button>
              <Button onClick={saveRoomChanges}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
