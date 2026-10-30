import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from './services/api.service';
import { User, UserPayload } from './models/user.model';
import { Product, ProductPayload } from './models/product.model';

type Section = 'users' | 'products';
type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly api = inject(ApiService);

  readonly section = signal<Section>('users');
  readonly users = signal<User[]>([]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly searchTerm = signal('');
  readonly editorOpen = signal(false);
  readonly editorMode = signal<EditorMode>('create');
  readonly editingId = signal<string | null>(null);
  readonly notice = signal('');
  readonly isUsers = computed(() => this.section() === 'users');
  readonly pageTitle = computed(() => this.isUsers() ? 'Users' : 'Products');
  readonly recordsCount = computed(() => this.isUsers() ? this.users().length : this.products().length);
  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.users().filter(user =>
      [user.name, user.email, user.role].some(value => value.toLowerCase().includes(term))
    );
  });
  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.products().filter(product =>
      [product.name, product.sku].some(value => value.toLowerCase().includes(term))
    );
  });

  userForm: UserPayload = this.emptyUser();
  productForm: ProductPayload = this.emptyProduct();

  constructor() {
    this.load('users');
  }

  setSection(section: Section): void {
    this.section.set(section);
    this.searchTerm.set('');
    this.closeEditor();
    this.load(section);
  }

  load(section: Section = this.section()): void {
    this.loading.set(true);
    this.error.set('');
  
    if (section === 'users') {
      this.api.getUsers()
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data: User[]) => this.users.set(data),
          error: () => {
            this.error.set(
              'Could not connect to the mock API. Make sure json-server is running on port 3000.'
            );
          }
        });
    } else {
      this.api.getProducts()
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data: Product[]) => this.products.set(data),
          error: () => {
            this.error.set(
              'Could not connect to the mock API. Make sure json-server is running on port 3000.'
            );
          }
        });
    }
  }

  openCreate(): void {
    this.editorMode.set('create');
    this.editingId.set(null);
    this.userForm = this.emptyUser();
    this.productForm = this.emptyProduct();
    this.editorOpen.set(true);
    this.error.set('');
  }

  editUser(user: User): void {
    this.editorMode.set('edit');
    this.editingId.set(user.id);
    this.userForm = { name: user.name, email: user.email, role: user.role };
    this.editorOpen.set(true);
    this.error.set('');
  }

  editProduct(product: Product): void {
    this.editorMode.set('edit');
    this.editingId.set(product.id);
    this.productForm = { name: product.name, sku: product.sku, price: product.price, stock: product.stock };
    this.editorOpen.set(true);
    this.error.set('');
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.editingId.set(null);
  }

  save(): void {
    this.error.set('');
    this.notice.set('');
    const id = this.editingId();
    this.loading.set(true);

    if (this.isUsers()) {
      const payload: UserPayload = { ...this.userForm };
      const request = id ? this.api.updateUser(id, payload) : this.api.createUser(payload);
      request.pipe(finalize(() => this.loading.set(false))).subscribe({
        next: saved => {
          this.users.update(items => id ? items.map(item => item.id === id ? saved : item) : [saved, ...items]);
          this.closeEditor();
          this.notice.set(id ? 'User updated successfully.' : 'User created successfully.');
        },
        error: () => this.error.set('Unable to save user. Check the mock API and try again.')
      });
    } else {
      const payload: ProductPayload = {
        ...this.productForm,
        price: Number(this.productForm.price),
        stock: Number(this.productForm.stock)
      };
      const request = id ? this.api.updateProduct(id, payload) : this.api.createProduct(payload);
      request.pipe(finalize(() => this.loading.set(false))).subscribe({
        next: saved => {
          this.products.update(items => id ? items.map(item => item.id === id ? saved : item) : [saved, ...items]);
          this.closeEditor();
          this.notice.set(id ? 'Product updated successfully.' : 'Product created successfully.');
        },
        error: () => this.error.set('Unable to save product. Check the mock API and try again.')
      });
    }
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete ${user.name}?`)) return;
    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update(items => items.filter(item => item.id !== user.id));
        this.notice.set('User deleted successfully.');
      },
      error: () => this.error.set('Unable to delete user. Please try again.')
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete ${product.name}?`)) return;
    this.api.deleteProduct(product.id).subscribe({
      next: () => {
        this.products.update(items => items.filter(item => item.id !== product.id));
        this.notice.set('Product deleted successfully.');
      },
      error: () => this.error.set('Unable to delete product. Please try again.')
    });
  }

  sumStock = (total: number, product: Product): number => total + product.stock;

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  private emptyUser(): UserPayload {
    return { name: '', email: '', role: 'Viewer' };
  }

  private emptyProduct(): ProductPayload {
    return { name: '', sku: '', price: 0, stock: 0 };
  }
}