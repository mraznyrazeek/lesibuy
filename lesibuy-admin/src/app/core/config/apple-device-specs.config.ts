export const IPHONE_SPECS_CONFIG: Record<
  string,
  {
    models: Record<
      string,
      {
        colors: string[];
        storage: string[];
      }
    >;
  }
> = {
  'iPhone 12': {
    models: {
      'iPhone 12 mini': {
        colors: ['Black', 'White', 'Red', 'Green', 'Blue', 'Purple'],
        storage: ['64GB', '128GB', '256GB']
      },
      'iPhone 12': {
        colors: ['Black', 'White', 'Red', 'Green', 'Blue', 'Purple'],
        storage: ['64GB', '128GB', '256GB']
      },
      'iPhone 12 Pro': {
        colors: ['Graphite', 'Silver', 'Gold', 'Pacific Blue'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 12 Pro Max': {
        colors: ['Graphite', 'Silver', 'Gold', 'Pacific Blue'],
        storage: ['128GB', '256GB', '512GB']
      }
    }
  },
  'iPhone 13': {
    models: {
      'iPhone 13 mini': {
        colors: ['Pink', 'Blue', 'Midnight', 'Starlight', 'Red', 'Green'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 13': {
        colors: ['Pink', 'Blue', 'Midnight', 'Starlight', 'Red', 'Green'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 13 Pro': {
        colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'],
        storage: ['128GB', '256GB', '512GB', '1TB']
      },
      'iPhone 13 Pro Max': {
        colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'],
        storage: ['128GB', '256GB', '512GB', '1TB']
      }
    }
  },
  'iPhone 14': {
    models: {
      'iPhone 14': {
        colors: ['Midnight', 'Starlight', 'Blue', 'Purple', 'Red', 'Yellow'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 14 Plus': {
        colors: ['Midnight', 'Starlight', 'Blue', 'Purple', 'Red', 'Yellow'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 14 Pro': {
        colors: ['Space Black', 'Silver', 'Gold', 'Deep Purple'],
        storage: ['128GB', '256GB', '512GB', '1TB']
      },
      'iPhone 14 Pro Max': {
        colors: ['Space Black', 'Silver', 'Gold', 'Deep Purple'],
        storage: ['128GB', '256GB', '512GB', '1TB']
      }
    }
  },
  'iPhone 15': {
    models: {
      'iPhone 15': {
        colors: ['Black', 'Blue', 'Green', 'Yellow', 'Pink'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 15 Plus': {
        colors: ['Black', 'Blue', 'Green', 'Yellow', 'Pink'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 15 Pro': {
        colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
        storage: ['128GB', '256GB', '512GB', '1TB']
      },
      'iPhone 15 Pro Max': {
        colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
        storage: ['256GB', '512GB', '1TB']
      }
    }
  },
  'iPhone 16': {
    models: {
      'iPhone 16': {
        colors: ['Black', 'White', 'Pink', 'Teal', 'Ultramarine'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 16 Plus': {
        colors: ['Black', 'White', 'Pink', 'Teal', 'Ultramarine'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 16 Pro': {
        colors: ['Black Titanium', 'White Titanium', 'Natural Titanium', 'Desert Titanium'],
        storage: ['128GB', '256GB', '512GB', '1TB']
      },
      'iPhone 16 Pro Max': {
        colors: ['Black Titanium', 'White Titanium', 'Natural Titanium', 'Desert Titanium'],
        storage: ['256GB', '512GB', '1TB']
      },
      'iPhone 16e': {
        colors: ['Black', 'White'],
        storage: ['128GB', '256GB', '512GB']
      }
    }
  },
  'iPhone 17': {
    models: {
      'iPhone 17': {
        colors: ['Black', 'Pink', 'Teal', 'Ultramarine'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone 17 Pro': {
        colors: ['Silver', 'Deep Blue', 'Cosmic Orange'],
        storage: ['256GB', '512GB', '1TB']
      },
      'iPhone 17 Pro Max': {
        colors: ['Silver', 'Deep Blue', 'Cosmic Orange'],
        storage: ['256GB', '512GB', '1TB', '2TB']
      },
      'iPhone 17e': {
        colors: ['Black', 'White'],
        storage: ['128GB', '256GB', '512GB']
      },
      'iPhone Air': {
        colors: ['Silver', 'Blue', 'Midnight'],
        storage: ['128GB', '256GB', '512GB']
      }
    }
  }
};

export const MACBOOK_SPECS_CONFIG: Record<
  string,
  {
    models: Record<
      string,
      {
        processors: string[];
        ram: string[];
        storage: string[];
        colors: string[];
        screens: string[];
      }
    >;
  }
> = {
  'MacBook Air': {
    models: {
      'MacBook Air M1': {
        processors: ['M1'],
        ram: ['8GB', '16GB'],
        storage: ['256GB SSD', '512GB SSD', '1TB SSD'],
        colors: ['Silver', 'Space Gray', 'Gold'],
        screens: ['13 inch']
      },
      'MacBook Air M2': {
        processors: ['M2'],
        ram: ['8GB', '16GB', '24GB'],
        storage: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'],
        colors: ['Midnight', 'Starlight', 'Silver', 'Space Gray'],
        screens: ['13.6 inch']
      },
      'MacBook Air M3': {
        processors: ['M3'],
        ram: ['8GB', '16GB', '24GB'],
        storage: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'],
        colors: ['Midnight', 'Starlight', 'Silver', 'Space Gray'],
        screens: ['13.6 inch', '15.3 inch']
      }
    }
  },
  'MacBook Pro': {
    models: {
      'MacBook Pro 13': {
        processors: ['M2'],
        ram: ['8GB', '16GB', '24GB'],
        storage: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'],
        colors: ['Silver', 'Space Gray'],
        screens: ['13 inch']
      },
      'MacBook Pro 14': {
        processors: ['M1 Pro', 'M1 Max', 'M2 Pro', 'M2 Max', 'M3 Pro', 'M3 Max'],
        ram: ['16GB', '18GB', '32GB', '36GB', '64GB'],
        storage: ['512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD'],
        colors: ['Silver', 'Space Black', 'Space Gray'],
        screens: ['14 inch']
      },
      'MacBook Pro 16': {
        processors: ['M1 Pro', 'M1 Max', 'M2 Pro', 'M2 Max', 'M3 Pro', 'M3 Max'],
        ram: ['16GB', '18GB', '32GB', '36GB', '64GB', '128GB'],
        storage: ['512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD', '8TB SSD'],
        colors: ['Silver', 'Space Black', 'Space Gray'],
        screens: ['16 inch']
      }
    }
  }
};

export const IPAD_SPECS_CONFIG: Record<
  string,
  {
    models: Record<
      string,
      {
        storage: string[];
        colors: string[];
        screen: string[];
        connectivity: string[];
      }
    >;
  }
> = {
  'iPad': {
    models: {
      'iPad 9th Gen': {
        storage: ['64GB', '256GB'],
        colors: ['Silver', 'Space Gray'],
        screen: ['10.2 inch'],
        connectivity: ['Wi-Fi', 'Wi-Fi + Cellular']
      },
      'iPad 10th Gen': {
        storage: ['64GB', '256GB'],
        colors: ['Silver', 'Blue', 'Pink', 'Yellow'],
        screen: ['10.9 inch'],
        connectivity: ['Wi-Fi', 'Wi-Fi + Cellular']
      }
    }
  },
  'iPad Air': {
    models: {
      'iPad Air 5': {
        storage: ['64GB', '256GB'],
        colors: ['Space Gray', 'Starlight', 'Pink', 'Purple', 'Blue'],
        screen: ['10.9 inch'],
        connectivity: ['Wi-Fi', 'Wi-Fi + Cellular']
      },
      'iPad Air M2': {
        storage: ['128GB', '256GB', '512GB', '1TB'],
        colors: ['Space Gray', 'Blue', 'Purple', 'Starlight'],
        screen: ['11 inch', '13 inch'],
        connectivity: ['Wi-Fi', 'Wi-Fi + Cellular']
      }
    }
  },
  'iPad Pro': {
    models: {
      'iPad Pro M2': {
        storage: ['128GB', '256GB', '512GB', '1TB', '2TB'],
        colors: ['Silver', 'Space Gray'],
        screen: ['11 inch', '12.9 inch'],
        connectivity: ['Wi-Fi', 'Wi-Fi + Cellular']
      },
      'iPad Pro M4': {
        storage: ['256GB', '512GB', '1TB', '2TB'],
        colors: ['Silver', 'Space Black'],
        screen: ['11 inch', '13 inch'],
        connectivity: ['Wi-Fi', 'Wi-Fi + Cellular']
      }
    }
  },
  'iPad mini': {
    models: {
      'iPad mini 6': {
        storage: ['64GB', '256GB'],
        colors: ['Space Gray', 'Pink', 'Purple', 'Starlight'],
        screen: ['8.3 inch'],
        connectivity: ['Wi-Fi', 'Wi-Fi + Cellular']
      }
    }
  }
};

export const AIRPODS_SPECS_CONFIG: Record<
  string,
  {
    models: Record<
      string,
      {
        caseType: string[];
        noiseCancellation: string[];
        colors: string[];
      }
    >;
  }
> = {
  AirPods: {
    models: {
      'AirPods 2nd Gen': {
        caseType: ['Standard Charging Case', 'Wireless Charging Case'],
        noiseCancellation: ['No'],
        colors: ['White']
      },
      'AirPods 3rd Gen': {
        caseType: ['Lightning Charging Case', 'MagSafe Charging Case'],
        noiseCancellation: ['No'],
        colors: ['White']
      },
      'AirPods Pro 1st Gen': {
        caseType: ['MagSafe Case'],
        noiseCancellation: ['Yes'],
        colors: ['White']
      },
      'AirPods Pro 2nd Gen': {
        caseType: ['MagSafe Case', 'USB-C MagSafe Case'],
        noiseCancellation: ['Yes'],
        colors: ['White']
      },
      'AirPods Max': {
        caseType: ['Smart Case'],
        noiseCancellation: ['Yes'],
        colors: ['Silver', 'Space Gray', 'Sky Blue', 'Pink', 'Green']
      }
    }
  }
};

export const WATCH_SPECS_CONFIG: Record<
  string,
  {
    models: Record<
      string,
      {
        sizes: string[];
        colors: string[];
        connectivity: string[];
      }
    >;
  }
> = {
  'Apple Watch SE': {
    models: {
      'Apple Watch SE 2nd Gen': {
        sizes: ['40mm', '44mm'],
        colors: ['Midnight', 'Starlight', 'Silver'],
        connectivity: ['GPS', 'GPS + Cellular']
      }
    }
  },
  'Apple Watch Series': {
    models: {
      'Apple Watch Series 8': {
        sizes: ['41mm', '45mm'],
        colors: ['Midnight', 'Starlight', 'Silver', 'Red'],
        connectivity: ['GPS', 'GPS + Cellular']
      },
      'Apple Watch Series 9': {
        sizes: ['41mm', '45mm'],
        colors: ['Midnight', 'Starlight', 'Silver', 'Pink', 'Red'],
        connectivity: ['GPS', 'GPS + Cellular']
      },
      'Apple Watch Series 10': {
        sizes: ['42mm', '46mm'],
        colors: ['Jet Black', 'Rose Gold', 'Silver'],
        connectivity: ['GPS', 'GPS + Cellular']
      }
    }
  },
  'Apple Watch Ultra': {
    models: {
      'Apple Watch Ultra': {
        sizes: ['49mm'],
        colors: ['Natural Titanium'],
        connectivity: ['GPS + Cellular']
      },
      'Apple Watch Ultra 2': {
        sizes: ['49mm'],
        colors: ['Natural Titanium', 'Black Titanium'],
        connectivity: ['GPS + Cellular']
      }
    }
  }
};

export const IPHONE_SIM_OPTIONS = ['eSIM', 'Single SIM', 'Dual SIM'];
export const YES_NO_OPTIONS = ['Yes', 'No'];
export const CONDITION_OPTIONS = ['Used', 'Refurbished', 'New'];