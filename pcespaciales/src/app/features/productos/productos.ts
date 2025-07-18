import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent {
  productos = [
    {
      id: 1,
      nombre: 'PC Gamer Pro',
      descripcion: 'PC Gaming de alto rendimiento con RTX 4090 y Ryzen 9',
      precio: 3500000,
      imagen: 'https://example.com/pc-gamer-pro.jpg',
      caracteristicas: [
        'Procesador: AMD Ryzen 9 7950X',
        'GPU: NVIDIA RTX 4090',
        'RAM: 64GB DDR5',
        'Almacenamiento: 2TB NVMe + 1TB SSD'
      ]
    },
    {
      id: 2,
      nombre: 'PC Gamer Elite',
      descripcion: 'PC Gaming profesional con RTX 4080 y Ryzen 7',
      precio: 2800000,
      imagen: 'https://example.com/pc-gamer-elite.jpg',
      caracteristicas: [
        'Procesador: AMD Ryzen 7 7800X',
        'GPU: NVIDIA RTX 4080',
        'RAM: 32GB DDR5',
        'Almacenamiento: 1TB NVMe'
      ]
    }
  ];
}
