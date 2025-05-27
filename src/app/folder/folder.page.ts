import { Component, importProvidersFrom, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeolocationService } from 'src/services/geolocation.services';
import * as L from 'leaflet';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  private map: any;
  public currentLocation: any;

  // Thông tin nhóm và app
  public appInfo = {
    name: 'GIS Mobile App',
    description: 'Ứng dụng bản đồ chuyên đề sử dụng Ionic Angular',
    version: '1.0.0'
  };

  public teamInfo = {
    groupName: 'Nhóm 9',
    className: 'DH22HM',
    major: 'Hệ thống thông tin địa lý',
    members: [
      'Đinh Trúc Vân: 22166102',
      'Nguyễn Quỳnh Nhi: 22166065',
      'Hồ Võ Minh Trường: 22166093',
      'Nguyễn Minh Phú: 22166069',
      'Trần Xuân Trường: 22166095',
      'Nguyễn Hoàng Minh Tuấn: 22166098',
      'Nguyễn Đức Trọng: 22166091',
      'Trần Dương Vinh: 22166103',
    ]
  };

  // Dữ liệu bản đồ chuyên đề mẫu
  public thematicLayers = [
    {
      name: 'Trường Đại học',
      description: 'Các trường đại học tại TP.HCM',
      data: [
        { name: 'ĐH Bách Khoa', lat: 10.7721, lng: 106.6576, info: 'Đại học Bách khoa TP.HCM' },
        { name: 'ĐH Khoa học Tự nhiên', lat: 10.7626, lng: 106.6824, info: 'Đại học Khoa học Tự nhiên' },
        { name: 'ĐH Kinh tế', lat: 10.7308, lng: 106.6941, info: 'Đại học Kinh tế TP.HCM' }
      ]
    },
    {
      name: 'Bệnh viện',
      description: 'Các bệnh viện lớn tại TP.HCM',
      data: [
        { name: 'BV Chợ Rẫy', lat: 10.7542, lng: 106.6665, info: 'Bệnh viện Chợ Rẫy' },
        { name: 'BV Bình Dan', lat: 10.7507, lng: 106.6647, info: 'Bệnh viện Bình Dan' },
        { name: 'BV 115', lat: 10.7825, lng: 106.6958, info: 'Bệnh viện 115' }
      ]
    }
  ];


  constructor(
    private geolocationService: GeolocationService
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;

    if (this.folder === 'explore') {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }


  async getCurrentLocation() {
    try {
      const permissions = await this.geolocationService.checkPermissions();

      if (permissions.location !== 'granted') {
        await this.geolocationService.requestPermissions();
      }

      this.currentLocation = await this.geolocationService.getCurrentPosition();

      if (this.map && this.currentLocation) {
        // Thêm marker vị trí hiện tại lên bản đồ
        const userMarker = L.marker([this.currentLocation.latitude, this.currentLocation.longitude])
          .addTo(this.map)
          .bindPopup(`
            <div>
              <h4>Vị trí hiện tại</h4>
              <p>Lat: ${this.currentLocation.latitude.toFixed(6)}</p>
              <p>Lng: ${this.currentLocation.longitude.toFixed(6)}</p>
              <p>Độ chính xác: ${this.currentLocation.accuracy}m</p>
            </div>
          `);

        // Di chuyển bản đồ đến vị trí hiện tại
        this.map.setView([this.currentLocation.latitude, this.currentLocation.longitude], 15);
      }
    } catch (error) {
      console.error('Lỗi khi lấy vị trí:', error);
      alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.');
    }
  }

  // private initializeMap() {
  //   // Khởi tạo bản đồ với OpenStreetMap
  //   this.map = L.map('map', {
  //     center: [10.762622, 106.660172],
  //     zoom: 11,
  //     scrollWheelZoom: true,
  //     touchZoom: true,
  //     doubleClickZoom: true,
  //     boxZoom: false,
  //     preferCanvas: true, // Tăng performance
  //     renderer: L.canvas() // Sử dụng Canvas thay vì SVG
  //   });

  //   // Thêm layer OpenStreetMap
  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '© OpenStreetMap contributors'
  //   }).addTo(this.map);

  //   // Thêm Google Maps layer (vệ tinh)
  //   const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  //     maxZoom: 20,
  //     subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  //   });

  //   // Thêm Google Maps layer (đường)
  //   const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  //     maxZoom: 20,
  //     subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  //   });

  //   // Thêm control layers
  //   const baseMaps = {
  //     "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  //     "Google Streets": googleStreets,
  //     "Google Satellite": googleSat
  //   };

  //   L.control.layers(baseMaps).addTo(this.map);

  //   // Thêm các điểm dữ liệu chuyên đề
  //   this.addThematicLayers();
  // }

  private initializeMap() {
    // Khởi tạo bản đồ với OpenStreetMap (load nhanh hơn Google Maps)
    this.map = L.map('map', {
      center: [10.762622, 106.660172],
      zoom: 11,
      scrollWheelZoom: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      preferCanvas: true, // Tăng performance
      renderer: L.canvas() // Sử dụng Canvas thay vì SVG
    });

    // Sử dụng OpenStreetMap làm layer chính (load nhanh nhất)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 8
    }).addTo(this.map);

    // Các layer bổ sung (optional)
    const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '© Google',
      maxZoom: 18,
      minZoom: 8
    });

    const googleStreets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '© Google',
      maxZoom: 18,
      minZoom: 8
    });

    // Control layers (ẩn mặc định để gọn gàng)
    const baseMaps = {
      "OpenStreetMap": osmLayer,
      "Google Streets": googleStreets,
      "Google Satellite": googleSat
    };

    const layerControl = L.control.layers(baseMaps, undefined, {
      collapsed: true,
      position: 'topright'
    }).addTo(this.map);

    // Thêm các điểm dữ liệu chuyên đề
    this.addThematicLayers();
  }

  private addThematicLayers() {
    // Tạo các icon khác nhau cho từng loại
    const universityIcon = L.divIcon({
      className: 'custom-icon university-icon',
      html: '🎓',
      iconSize: [30, 30]
    });

    const hospitalIcon = L.divIcon({
      className: 'custom-icon hospital-icon',
      html: '🏥',
      iconSize: [30, 30]
    });

    // Thêm layer trường đại học
    this.thematicLayers[0].data.forEach(point => {
      L.marker([point.lat, point.lng], { icon: universityIcon })
        .addTo(this.map)
        .bindPopup(`
          <div>
            <h4>${point.name}</h4>
            <p>${point.info}</p>
            <p><strong>Loại:</strong> Trường Đại học</p>
          </div>
        `);
    });

    // Thêm layer bệnh viện
    this.thematicLayers[1].data.forEach(point => {
      L.marker([point.lat, point.lng], { icon: hospitalIcon })
        .addTo(this.map)
        .bindPopup(`
          <div>
            <h4>${point.name}</h4>
            <p>${point.info}</p>
            <p><strong>Loại:</strong> Bệnh viện</p>
          </div>
        `);
    });
  }


  getPageTitle(): string {
    switch (this.folder) {
      case 'home': return 'Trang chủ';
      case 'about': return 'Giới thiệu';
      case 'explore': return 'Khám phá bản đồ';
      case 'contact': return 'Liên hệ';
      default: return this.folder;
    }
  }

}
