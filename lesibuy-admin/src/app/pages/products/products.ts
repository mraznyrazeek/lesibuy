import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import {
  IPHONE_SPECS_CONFIG,
  MACBOOK_SPECS_CONFIG,
  IPAD_SPECS_CONFIG,
  AIRPODS_SPECS_CONFIG,
  WATCH_SPECS_CONFIG,
  IPHONE_SIM_OPTIONS,
  YES_NO_OPTIONS,
  CONDITION_OPTIONS
} from '../../core/config/apple-device-specs.config';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit {
  categories: Category[] = [];

  showForm = false;
  isEditMode = false;
  editingProductId: number | null = null;

  validationErrors: string[] = [];
  imageError = '';

  selectedImageFiles: File[] = [];
  imagePreviewUrls: string[] = [];

  yesNoOptions = YES_NO_OPTIONS;
  iphoneSimOptions = IPHONE_SIM_OPTIONS;
  conditionOptions = CONDITION_OPTIONS;

  iphoneSeriesOptions: string[] = Object.keys(IPHONE_SPECS_CONFIG);
  iphoneModelOptions: string[] = [];
  iphoneColorOptions: string[] = [];
  iphoneStorageOptions: string[] = [];

  macbookFamilyOptions: string[] = Object.keys(MACBOOK_SPECS_CONFIG);
  macbookModelOptions: string[] = [];
  macbookProcessorOptions: string[] = [];
  macbookRamOptions: string[] = [];
  macbookStorageOptions: string[] = [];
  macbookColorOptions: string[] = [];
  macbookScreenOptions: string[] = [];

  ipadFamilyOptions: string[] = Object.keys(IPAD_SPECS_CONFIG);
  ipadModelOptions: string[] = [];
  ipadStorageOptions: string[] = [];
  ipadColorOptions: string[] = [];
  ipadScreenOptions: string[] = [];
  ipadConnectivityOptions: string[] = [];

  airpodsFamilyOptions: string[] = Object.keys(AIRPODS_SPECS_CONFIG);
  airpodsModelOptions: string[] = [];
  airpodsCaseTypeOptions: string[] = [];
  airpodsNoiseOptions: string[] = [];
  airpodsColorOptions: string[] = [];

  watchFamilyOptions: string[] = Object.keys(WATCH_SPECS_CONFIG);
  watchModelOptions: string[] = [];
  watchSizeOptions: string[] = [];
  watchColorOptions: string[] = [];
  watchConnectivityOptions: string[] = [];

  iphoneSpecs = {
    series: '',
    model: '',
    color: '',
    storage: '',
    batteryHealth: '',
    sim: '',
    box: '',
    accessories: '',
    condition: ''
  };

  macbookSpecs = {
    family: '',
    model: '',
    processor: '',
    ram: '',
    storage: '',
    color: '',
    screen: '',
    box: '',
    accessories: '',
    condition: ''
  };

  ipadSpecs = {
    family: '',
    model: '',
    storage: '',
    color: '',
    screen: '',
    connectivity: '',
    box: '',
    accessories: '',
    condition: ''
  };

  airpodsSpecs = {
    family: '',
    model: '',
    caseType: '',
    noiseCancellation: '',
    color: '',
    box: '',
    accessories: '',
    condition: ''
  };

  watchSpecs = {
    family: '',
    model: '',
    size: '',
    color: '',
    connectivity: '',
    box: '',
    accessories: '',
    condition: ''
  };

  newProduct = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    imageUrl: '',
    categoryId: 0,
    condition: '',
    sellerType: 'Admin',
    specifications: ''
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  checkEditMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const productId = Number(idParam);

      if (!isNaN(productId) && productId > 0) {
        this.loadProductForEdit(productId);
        return;
      }
    }

    this.openAddForm();
  }

  loadProductForEdit(productId: number): void {
    this.productService.getById(productId).subscribe({
      next: (product) => {
        this.populateFormForEdit(product);
      },
      error: (error) => {
        console.error('Failed to load product for edit:', error);
        alert('Failed to load product details.');
        this.router.navigate(['/products']);
      }
    });
  }

  populateFormForEdit(product: Product): void {
    this.resetForm();

    this.newProduct = {
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? 0,
      stockQuantity: product.stockQuantity ?? 0,
      imageUrl: product.imageUrl ?? '',
      categoryId: product.categoryId ?? 0,
      condition: product.condition ?? '',
      sellerType: product.sellerType ?? 'Admin',
      specifications: product.specifications ?? ''
    };

    try {
      const parsed = product.specifications ? JSON.parse(product.specifications) : null;

      if (this.isIphoneCategory() && parsed) {
        this.iphoneSpecs = { ...this.iphoneSpecs, ...parsed };
        this.onIphoneSeriesChange();
        this.iphoneSpecs.model = parsed.model ?? '';
        this.onIphoneModelChange();
        this.iphoneSpecs.color = parsed.color ?? '';
        this.iphoneSpecs.storage = parsed.storage ?? '';
      }

      if (this.isMacbookCategory() && parsed) {
        this.macbookSpecs = { ...this.macbookSpecs, ...parsed };
        this.onMacbookFamilyChange();
        this.macbookSpecs.model = parsed.model ?? '';
        this.onMacbookModelChange();
        this.macbookSpecs.processor = parsed.processor ?? '';
        this.macbookSpecs.ram = parsed.ram ?? '';
        this.macbookSpecs.storage = parsed.storage ?? '';
        this.macbookSpecs.color = parsed.color ?? '';
        this.macbookSpecs.screen = parsed.screen ?? '';
      }

      if (this.isIpadCategory() && parsed) {
        this.ipadSpecs = { ...this.ipadSpecs, ...parsed };
        this.onIpadFamilyChange();
        this.ipadSpecs.model = parsed.model ?? '';
        this.onIpadModelChange();
        this.ipadSpecs.storage = parsed.storage ?? '';
        this.ipadSpecs.color = parsed.color ?? '';
        this.ipadSpecs.screen = parsed.screen ?? '';
        this.ipadSpecs.connectivity = parsed.connectivity ?? '';
      }

      if (this.isAirpodsCategory() && parsed) {
        this.airpodsSpecs = { ...this.airpodsSpecs, ...parsed };
        this.onAirpodsFamilyChange();
        this.airpodsSpecs.model = parsed.model ?? '';
        this.onAirpodsModelChange();
        this.airpodsSpecs.caseType = parsed.caseType ?? '';
        this.airpodsSpecs.noiseCancellation = parsed.noiseCancellation ?? '';
        this.airpodsSpecs.color = parsed.color ?? '';
      }

      if (this.isWatchCategory() && parsed) {
        this.watchSpecs = { ...this.watchSpecs, ...parsed };
        this.onWatchFamilyChange();
        this.watchSpecs.model = parsed.model ?? '';
        this.onWatchModelChange();
        this.watchSpecs.size = parsed.size ?? '';
        this.watchSpecs.color = parsed.color ?? '';
        this.watchSpecs.connectivity = parsed.connectivity ?? '';
      }
    } catch (error) {
      console.error('Failed to parse specifications JSON', error);
    }

    this.isEditMode = true;
    this.editingProductId = product.id;
    this.showForm = true;
  }

  get selectedCategory(): Category | undefined {
    return this.categories.find(c => c.id === Number(this.newProduct.categoryId));
  }

  isCategorySelected(): boolean {
    return Number(this.newProduct.categoryId) > 0;
  }

  getCategoryName(): string {
    return this.selectedCategory?.name?.toLowerCase()?.trim() ?? '';
  }

  isIphoneCategory(): boolean {
    return this.getCategoryName() === 'iphone';
  }

  isMacbookCategory(): boolean {
    return this.getCategoryName() === 'macbook';
  }

  isIpadCategory(): boolean {
    return this.getCategoryName() === 'ipad';
  }

  isAirpodsCategory(): boolean {
    return this.getCategoryName() === 'airpods' || this.getCategoryName() === 'audio';
  }

  isWatchCategory(): boolean {
    return this.getCategoryName() === 'watch' || this.getCategoryName() === 'apple watch';
  }

  getDetailsSectionTitle(): string {
    if (this.isIphoneCategory()) return 'iPhone Details';
    if (this.isMacbookCategory()) return 'MacBook Details';
    if (this.isIpadCategory()) return 'iPad Details';
    if (this.isAirpodsCategory()) return 'Audio Details';
    if (this.isWatchCategory()) return 'Watch Details';
    return 'Product Details';
  }

  onCategoryChange(): void {
    this.validationErrors = [];
    this.resetAllSpecs();
  }

  canEnablePricingSection(): boolean {
    if (!this.isCategorySelected()) return false;

    if (this.isIphoneCategory()) {
      return !!this.iphoneSpecs.series && !!this.iphoneSpecs.model;
    }

    if (this.isMacbookCategory()) {
      return !!this.macbookSpecs.family && !!this.macbookSpecs.model;
    }

    if (this.isIpadCategory()) {
      return !!this.ipadSpecs.family && !!this.ipadSpecs.model;
    }

    if (this.isAirpodsCategory()) {
      return !!this.airpodsSpecs.family && !!this.airpodsSpecs.model;
    }

    if (this.isWatchCategory()) {
      return !!this.watchSpecs.family && !!this.watchSpecs.model;
    }

    return !!this.newProduct.name;
  }

  getPricingSectionMessage(): string {
    if (!this.isCategorySelected()) {
      return 'Choose a category first.';
    }

    if (this.isIphoneCategory() && !this.canEnablePricingSection()) {
      return 'Choose iPhone series and model first.';
    }

    if (this.isMacbookCategory() && !this.canEnablePricingSection()) {
      return 'Choose MacBook family and model first.';
    }

    if (this.isIpadCategory() && !this.canEnablePricingSection()) {
      return 'Choose iPad family and model first.';
    }

    if (this.isAirpodsCategory() && !this.canEnablePricingSection()) {
      return 'Choose audio family and model first.';
    }

    if (this.isWatchCategory() && !this.canEnablePricingSection()) {
      return 'Choose watch family and model first.';
    }

    return '';
  }

  onIphoneSeriesChange(): void {
    this.iphoneSpecs.model = '';
    this.iphoneSpecs.color = '';
    this.iphoneSpecs.storage = '';

    const selectedSeries = IPHONE_SPECS_CONFIG[this.iphoneSpecs.series];
    this.iphoneModelOptions = selectedSeries ? Object.keys(selectedSeries.models) : [];
    this.iphoneColorOptions = [];
    this.iphoneStorageOptions = [];
  }

  onIphoneModelChange(): void {
    this.iphoneSpecs.color = '';
    this.iphoneSpecs.storage = '';

    const selectedSeries = IPHONE_SPECS_CONFIG[this.iphoneSpecs.series];
    const selectedModel = selectedSeries?.models[this.iphoneSpecs.model];

    this.iphoneColorOptions = selectedModel?.colors ?? [];
    this.iphoneStorageOptions = selectedModel?.storage ?? [];
  }

  onMacbookFamilyChange(): void {
    this.macbookSpecs.model = '';
    this.macbookSpecs.processor = '';
    this.macbookSpecs.ram = '';
    this.macbookSpecs.storage = '';
    this.macbookSpecs.color = '';
    this.macbookSpecs.screen = '';

    const selectedFamily = MACBOOK_SPECS_CONFIG[this.macbookSpecs.family];
    this.macbookModelOptions = selectedFamily ? Object.keys(selectedFamily.models) : [];
    this.macbookProcessorOptions = [];
    this.macbookRamOptions = [];
    this.macbookStorageOptions = [];
    this.macbookColorOptions = [];
    this.macbookScreenOptions = [];
  }

  onMacbookModelChange(): void {
    this.macbookSpecs.processor = '';
    this.macbookSpecs.ram = '';
    this.macbookSpecs.storage = '';
    this.macbookSpecs.color = '';
    this.macbookSpecs.screen = '';

    const selectedFamily = MACBOOK_SPECS_CONFIG[this.macbookSpecs.family];
    const selectedModel = selectedFamily?.models[this.macbookSpecs.model];

    this.macbookProcessorOptions = selectedModel?.processors ?? [];
    this.macbookRamOptions = selectedModel?.ram ?? [];
    this.macbookStorageOptions = selectedModel?.storage ?? [];
    this.macbookColorOptions = selectedModel?.colors ?? [];
    this.macbookScreenOptions = selectedModel?.screens ?? [];
  }

  onIpadFamilyChange(): void {
    this.ipadSpecs.model = '';
    this.ipadSpecs.storage = '';
    this.ipadSpecs.color = '';
    this.ipadSpecs.screen = '';
    this.ipadSpecs.connectivity = '';

    const selectedFamily = IPAD_SPECS_CONFIG[this.ipadSpecs.family];
    this.ipadModelOptions = selectedFamily ? Object.keys(selectedFamily.models) : [];
    this.ipadStorageOptions = [];
    this.ipadColorOptions = [];
    this.ipadScreenOptions = [];
    this.ipadConnectivityOptions = [];
  }

  onIpadModelChange(): void {
    this.ipadSpecs.storage = '';
    this.ipadSpecs.color = '';
    this.ipadSpecs.screen = '';
    this.ipadSpecs.connectivity = '';

    const selectedFamily = IPAD_SPECS_CONFIG[this.ipadSpecs.family];
    const selectedModel = selectedFamily?.models[this.ipadSpecs.model];

    this.ipadStorageOptions = selectedModel?.storage ?? [];
    this.ipadColorOptions = selectedModel?.colors ?? [];
    this.ipadScreenOptions = selectedModel?.screen ?? [];
    this.ipadConnectivityOptions = selectedModel?.connectivity ?? [];
  }

  onAirpodsFamilyChange(): void {
    this.airpodsSpecs.model = '';
    this.airpodsSpecs.caseType = '';
    this.airpodsSpecs.noiseCancellation = '';
    this.airpodsSpecs.color = '';

    const selectedFamily = AIRPODS_SPECS_CONFIG[this.airpodsSpecs.family];
    this.airpodsModelOptions = selectedFamily ? Object.keys(selectedFamily.models) : [];
    this.airpodsCaseTypeOptions = [];
    this.airpodsNoiseOptions = [];
    this.airpodsColorOptions = [];
  }

  onAirpodsModelChange(): void {
    this.airpodsSpecs.caseType = '';
    this.airpodsSpecs.noiseCancellation = '';
    this.airpodsSpecs.color = '';

    const selectedFamily = AIRPODS_SPECS_CONFIG[this.airpodsSpecs.family];
    const selectedModel = selectedFamily?.models[this.airpodsSpecs.model];

    this.airpodsCaseTypeOptions = selectedModel?.caseType ?? [];
    this.airpodsNoiseOptions = selectedModel?.noiseCancellation ?? [];
    this.airpodsColorOptions = selectedModel?.colors ?? [];
  }

  onWatchFamilyChange(): void {
    this.watchSpecs.model = '';
    this.watchSpecs.size = '';
    this.watchSpecs.color = '';
    this.watchSpecs.connectivity = '';

    const selectedFamily = WATCH_SPECS_CONFIG[this.watchSpecs.family];
    this.watchModelOptions = selectedFamily ? Object.keys(selectedFamily.models) : [];
    this.watchSizeOptions = [];
    this.watchColorOptions = [];
    this.watchConnectivityOptions = [];
  }

  onWatchModelChange(): void {
    this.watchSpecs.size = '';
    this.watchSpecs.color = '';
    this.watchSpecs.connectivity = '';

    const selectedFamily = WATCH_SPECS_CONFIG[this.watchSpecs.family];
    const selectedModel = selectedFamily?.models[this.watchSpecs.model];

    this.watchSizeOptions = selectedModel?.sizes ?? [];
    this.watchColorOptions = selectedModel?.colors ?? [];
    this.watchConnectivityOptions = selectedModel?.connectivity ?? [];
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.imageError = '';
    this.selectedImageFiles = [];
    this.imagePreviewUrls = [];

    if (!files.length) {
      this.newProduct.imageUrl = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const invalidFile = files.find(file => !allowedTypes.includes(file.type));

    if (invalidFile) {
      this.imageError = 'Only JPG, JPEG, and PNG files are allowed.';
      input.value = '';
      this.newProduct.imageUrl = '';
      return;
    }

    this.selectedImageFiles = files;

    const fileNames = files.map(file => file.name);
    this.newProduct.imageUrl = JSON.stringify(fileNames);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrls.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeSelectedImage(index: number): void {
    this.selectedImageFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);

    const fileNames = this.selectedImageFiles.map(file => file.name);
    this.newProduct.imageUrl = fileNames.length ? JSON.stringify(fileNames) : '';
  }

  getImageNames(): string[] {
    try {
      const parsed = JSON.parse(this.newProduct.imageUrl);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return this.newProduct.imageUrl ? [this.newProduct.imageUrl] : [];
    }
  }

  buildProductName(): string {
    if (this.isIphoneCategory()) {
      return [this.iphoneSpecs.model, this.iphoneSpecs.storage, this.iphoneSpecs.color].filter(Boolean).join(' - ');
    }

    if (this.isMacbookCategory()) {
      return [this.macbookSpecs.model, this.macbookSpecs.ram, this.macbookSpecs.storage, this.macbookSpecs.color].filter(Boolean).join(' - ');
    }

    if (this.isIpadCategory()) {
      return [this.ipadSpecs.model, this.ipadSpecs.storage, this.ipadSpecs.color].filter(Boolean).join(' - ');
    }

    if (this.isAirpodsCategory()) {
      return [this.airpodsSpecs.model, this.airpodsSpecs.caseType].filter(Boolean).join(' - ');
    }

    if (this.isWatchCategory()) {
      return [this.watchSpecs.model, this.watchSpecs.size, this.watchSpecs.color].filter(Boolean).join(' - ');
    }

    return this.newProduct.name.trim();
  }

  validateForm(): boolean {
    this.validationErrors = [];

    if (!this.isCategorySelected()) {
      this.validationErrors.push('Please choose a category first.');
    }

    if (!this.newProduct.price || Number(this.newProduct.price) <= 0) {
      this.validationErrors.push('Please enter a valid price.');
    }

    if (Number(this.newProduct.stockQuantity) < 0) {
      this.validationErrors.push('Please enter a valid stock quantity.');
    }

    if (this.isIphoneCategory()) {
      if (!this.iphoneSpecs.series) this.validationErrors.push('Please choose an iPhone series.');
      if (!this.iphoneSpecs.model) this.validationErrors.push('Please choose an iPhone model.');
      if (!this.iphoneSpecs.color) this.validationErrors.push('Please choose a color.');
      if (!this.iphoneSpecs.storage) this.validationErrors.push('Please choose a storage option.');
      if (!this.iphoneSpecs.sim) this.validationErrors.push('Please choose a SIM type.');
      if (!this.iphoneSpecs.box) this.validationErrors.push('Please choose box status.');
      if (!this.iphoneSpecs.condition) this.validationErrors.push('Please choose product condition.');
    }

    if (this.isMacbookCategory()) {
      if (!this.macbookSpecs.family) this.validationErrors.push('Please choose a MacBook family.');
      if (!this.macbookSpecs.model) this.validationErrors.push('Please choose a MacBook model.');
      if (!this.macbookSpecs.processor) this.validationErrors.push('Please choose a processor.');
      if (!this.macbookSpecs.ram) this.validationErrors.push('Please choose RAM.');
      if (!this.macbookSpecs.storage) this.validationErrors.push('Please choose storage.');
      if (!this.macbookSpecs.color) this.validationErrors.push('Please choose a color.');
      if (!this.macbookSpecs.screen) this.validationErrors.push('Please choose a screen size.');
      if (!this.macbookSpecs.box) this.validationErrors.push('Please choose box status.');
      if (!this.macbookSpecs.condition) this.validationErrors.push('Please choose product condition.');
    }

    if (this.isIpadCategory()) {
      if (!this.ipadSpecs.family) this.validationErrors.push('Please choose an iPad family.');
      if (!this.ipadSpecs.model) this.validationErrors.push('Please choose an iPad model.');
      if (!this.ipadSpecs.storage) this.validationErrors.push('Please choose storage.');
      if (!this.ipadSpecs.color) this.validationErrors.push('Please choose a color.');
      if (!this.ipadSpecs.screen) this.validationErrors.push('Please choose a screen size.');
      if (!this.ipadSpecs.connectivity) this.validationErrors.push('Please choose connectivity.');
      if (!this.ipadSpecs.box) this.validationErrors.push('Please choose box status.');
      if (!this.ipadSpecs.condition) this.validationErrors.push('Please choose product condition.');
    }

    if (this.isAirpodsCategory()) {
      if (!this.airpodsSpecs.family) this.validationErrors.push('Please choose an audio family.');
      if (!this.airpodsSpecs.model) this.validationErrors.push('Please choose an audio model.');
      if (!this.airpodsSpecs.caseType) this.validationErrors.push('Please choose case type.');
      if (!this.airpodsSpecs.noiseCancellation) this.validationErrors.push('Please choose noise cancellation.');
      if (!this.airpodsSpecs.color) this.validationErrors.push('Please choose a color.');
      if (!this.airpodsSpecs.box) this.validationErrors.push('Please choose box status.');
      if (!this.airpodsSpecs.condition) this.validationErrors.push('Please choose product condition.');
    }

    if (this.isWatchCategory()) {
      if (!this.watchSpecs.family) this.validationErrors.push('Please choose a watch family.');
      if (!this.watchSpecs.model) this.validationErrors.push('Please choose a watch model.');
      if (!this.watchSpecs.size) this.validationErrors.push('Please choose watch size.');
      if (!this.watchSpecs.color) this.validationErrors.push('Please choose a color.');
      if (!this.watchSpecs.connectivity) this.validationErrors.push('Please choose connectivity.');
      if (!this.watchSpecs.box) this.validationErrors.push('Please choose box status.');
      if (!this.watchSpecs.condition) this.validationErrors.push('Please choose product condition.');
    }

    if (!this.newProduct.imageUrl.trim()) {
      this.validationErrors.push('Please upload at least one product image.');
    }

    if (this.imageError) {
      this.validationErrors.push(this.imageError);
    }

    return this.validationErrors.length === 0;
  }

  buildSpecificationsPayload(): string {
    if (this.isIphoneCategory()) return JSON.stringify(this.iphoneSpecs);
    if (this.isMacbookCategory()) return JSON.stringify(this.macbookSpecs);
    if (this.isIpadCategory()) return JSON.stringify(this.ipadSpecs);
    if (this.isAirpodsCategory()) return JSON.stringify(this.airpodsSpecs);
    if (this.isWatchCategory()) return JSON.stringify(this.watchSpecs);

    return this.newProduct.specifications;
  }

  getConditionValue(): string {
    if (this.isIphoneCategory()) return this.iphoneSpecs.condition;
    if (this.isMacbookCategory()) return this.macbookSpecs.condition;
    if (this.isIpadCategory()) return this.ipadSpecs.condition;
    if (this.isAirpodsCategory()) return this.airpodsSpecs.condition;
    if (this.isWatchCategory()) return this.watchSpecs.condition;

    return this.newProduct.condition;
  }

  saveProduct(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload = {
      id: this.isEditMode ? this.editingProductId ?? 0 : 0,
      name: this.buildProductName(),
      description: this.newProduct.description,
      price: Number(this.newProduct.price),
      stockQuantity: Number(this.newProduct.stockQuantity),
      imageUrl: this.newProduct.imageUrl,
      categoryId: Number(this.newProduct.categoryId),
      condition: this.getConditionValue(),
      sellerType: this.newProduct.sellerType,
      specifications: this.buildSpecificationsPayload()
    };

    if (this.isEditMode && this.editingProductId !== null) {
      this.productService.update(this.editingProductId, payload).subscribe({
        next: () => {
          this.resetForm();
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Update error:', err);
          alert(JSON.stringify(err?.error ?? 'Failed to update product'));
        }
      });
      return;
    }

    this.productService.create(payload).subscribe({
      next: () => {
        this.resetForm();
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        alert(JSON.stringify(err?.error ?? 'Failed to add product'));
      }
    });
  }

  cancelForm(): void {
    this.resetForm();
    this.router.navigate(['/products']);
  }

  openAddForm(): void {
    this.resetForm();
    this.showForm = true;
    this.isEditMode = false;
    this.editingProductId = null;
  }

  resetAllSpecs(): void {
    this.resetIphoneSpecs();
    this.resetMacbookSpecs();
    this.resetIpadSpecs();
    this.resetAirpodsSpecs();
    this.resetWatchSpecs();
  }

  resetIphoneSpecs(): void {
    this.iphoneSpecs = {
      series: '',
      model: '',
      color: '',
      storage: '',
      batteryHealth: '',
      sim: '',
      box: '',
      accessories: '',
      condition: ''
    };
    this.iphoneModelOptions = [];
    this.iphoneColorOptions = [];
    this.iphoneStorageOptions = [];
  }

  resetMacbookSpecs(): void {
    this.macbookSpecs = {
      family: '',
      model: '',
      processor: '',
      ram: '',
      storage: '',
      color: '',
      screen: '',
      box: '',
      accessories: '',
      condition: ''
    };
    this.macbookModelOptions = [];
    this.macbookProcessorOptions = [];
    this.macbookRamOptions = [];
    this.macbookStorageOptions = [];
    this.macbookColorOptions = [];
    this.macbookScreenOptions = [];
  }

  resetIpadSpecs(): void {
    this.ipadSpecs = {
      family: '',
      model: '',
      storage: '',
      color: '',
      screen: '',
      connectivity: '',
      box: '',
      accessories: '',
      condition: ''
    };
    this.ipadModelOptions = [];
    this.ipadStorageOptions = [];
    this.ipadColorOptions = [];
    this.ipadScreenOptions = [];
    this.ipadConnectivityOptions = [];
  }

  resetAirpodsSpecs(): void {
    this.airpodsSpecs = {
      family: '',
      model: '',
      caseType: '',
      noiseCancellation: '',
      color: '',
      box: '',
      accessories: '',
      condition: ''
    };
    this.airpodsModelOptions = [];
    this.airpodsCaseTypeOptions = [];
    this.airpodsNoiseOptions = [];
    this.airpodsColorOptions = [];
  }

  resetWatchSpecs(): void {
    this.watchSpecs = {
      family: '',
      model: '',
      size: '',
      color: '',
      connectivity: '',
      box: '',
      accessories: '',
      condition: ''
    };
    this.watchModelOptions = [];
    this.watchSizeOptions = [];
    this.watchColorOptions = [];
    this.watchConnectivityOptions = [];
  }

  resetForm(): void {
    this.validationErrors = [];
    this.imageError = '';
    this.selectedImageFiles = [];
    this.imagePreviewUrls = [];

    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
      categoryId: 0,
      condition: '',
      sellerType: 'Admin',
      specifications: ''
    };

    this.resetAllSpecs();
    this.isEditMode = false;
    this.editingProductId = null;
  }
}