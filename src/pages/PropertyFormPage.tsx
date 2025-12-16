import React, { useEffect } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreatePropertyInput, CreateApartment, CreateHouse, CreateLand,
  Property,
  PropertyType,
  PropertyStatus,
  TransactionType,
  PriceDisclosure,
  Commission,
  Taxes,
  Utilities,
  Equipment,
  InternetConnection,
  ConstructionMaterial,
  BuildingCondition,
  EnergyEfficiencyClass,
  BuildingLocation,
  AddressRegion,
  ApartmentOwnershipType,
  HouseType,
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import propertyService from '@/services/propertyService';

const newApartment = (baseObj: CreatePropertyInput, data: PropertyFormValues): CreateApartment => {
  return {
           ...baseObj,
           ownershipType: ApartmentOwnershipType.COOPERATIVE_OWNERSHIP,
           floor: data.floor || 1,
           totalFloors: data.floor || 1,
           elevator: true,
           balcony: false,
           rooms: data.rooms
  };
};

const newHouse = (baseObj: CreatePropertyInput, data: PropertyFormValues): CreateHouse => {
  return {
           ...baseObj,
           plotArea: data.size,
           houseType: HouseType.DETACHED,
           stories: data.floor || 1
  };
};

const newLand = (baseObj: CreatePropertyInput, data: PropertyFormValues): CreateLand => {
  return {
           ...baseObj,
           isForHousing: true
  };
};

const newPropertyObject = async (data: PropertyFormValues): Promise<Property> => {
  let baseObj = {
           name: data.title,
           usableArea: data.size,
           contractType: data.transactionType,
           listedAt: new Date(),
           priceDisclosure: PriceDisclosure.NOT_DISCLOSED,
           commission: Commission.INCLUDED,
           taxes: Taxes.INCLUDED,
           equipment: Equipment.FURNISHED,
           type: data.type,
           description: data.description,
           price: data.price,
           status: data.status,
           utilities: {
             hasWater: true,
             hasWell: true,
             hasElectricity: true,
             hasGas: true,
             hasSewerage: true,
             hasCesspool: true,
             hasHeating: true,
             hasPhoneLine: true,
             hasCableTV: true,
             hasRecycling: true,
             hasBarrierFreeAccess: true,
             internetConnection: InternetConnection.DSL,
             parkingPlaces: 1
           },
           civicAmenities: {
             busStop: false,
             trainStation: false,
             postOffice: false,
             atm: false,
             generalPractitioner: false,
             veterinarian: false,
             elementarySchool: false,
             kindergarten: false,
             supermarket: false,
             smallShop: false,
             restaurant: false,
             pub: false,
             playground: false,
             subway: false
           },
           transportPossibilities: {
              road: true,
              highway: false,
              train: false,
              bus: true,
              publicTransport: true,
              airplane: false,
              boat: false,
              ferry: false,
            },
           basement: false,
           agentId: 7,
           buildingProperties: {
             constructionMaterial: ConstructionMaterial.BRICK,
             buildingCondition: BuildingCondition.GOOD,
             energyEfficiencyClass: EnergyEfficiencyClass.A,
             buildingLocation: BuildingLocation.SUBURBS,
             isInProtectionZone: false
           },
           address: {
             street: data.street,
             city: data.city,
             postalCode: data.zipCode,
             country: data.country,
             region: AddressRegion.PRAHA
           }
  };

  if (data.type === PropertyType.APARTMENT) {
    return await propertyService.createApartment(newApartment(baseObj, data));
  }
  if (data.type === PropertyType.HOUSE) {
    return await propertyService.createHouse(newHouse(baseObj, data));
  }
  return await propertyService.createLand(newLand(baseObj, data));
};

// Validation schema
const propertyFormSchema = z.object({
  title: z.string().min(5, 'Nadpis musí mít alespoň 5 znaků').max(100, 'Nadpis je příliš dlouhý'),
  description: z.string().min(20, 'Popis musí mít alespoň 20 znaků').max(1000, 'Popis je příliš dlouhý'),
  price: z.number().min(1, 'Cena musí být větší než 0'),
  type: z.nativeEnum(PropertyType),
  status: z.nativeEnum(PropertyStatus),
  transactionType: z.nativeEnum(TransactionType),
  size: z.number().min(1, 'Velikost musí být větší než 0'),
  rooms: z.number().min(1, 'Počet pokojů musí být alespoň 1'),
  bedrooms: z.number().min(0, 'Počet ložnic nemůže být záporný'),
  bathrooms: z.number().min(1, 'Počet koupelen musí být alespoň 1'),
  floor: z.number().optional(),
  yearBuilt: z.number().min(1800, 'Rok výstavby je neplatný').max(new Date().getFullYear(), 'Rok výstavby nemůže být v budoucnosti').optional(),
  energyClass: z.string().optional(),
  // Address fields
  street: z.string().min(3, 'Ulice musí mít alespoň 3 znaky'),
  city: z.string().min(2, 'Město musí mít alespoň 2 znaky'),
  zipCode: z.string().regex(/^\d{3}\s?\d{2}$/, 'PSČ musí být ve formátu 123 45'),
  country: z.string(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const PropertyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      type: PropertyType.APARTMENT,
      status: PropertyStatus.AVAILABLE,
      transactionType: TransactionType.SALE,
      size: 0,
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      floor: undefined,
      yearBuilt: undefined,
      energyClass: undefined,
      street: '',
      city: '',
      zipCode: '',
      country: 'Česká republika',
    },
  });

  // Load existing property data when in edit mode
  useEffect(() => {
    const loadExistingProperty = async (id: string | undefined) => {
      try {
        if (isEditMode && id) {
          const property = await propertyService.getProperty(parseInt(id));
          if (property) {
            // Map property fields to form fields
            form.reset({
              title: property.name,
              description: property.description,
              price: property.price,
              type: property.type,
              status: property.status,
              transactionType: property.contractType,
              size: property.usableArea,
              rooms: property.type === PropertyType.APARTMENT ? (property as any).rooms : 1,
              bedrooms: 0, // Not in new structure
              bathrooms: 1, // Not in new structure
              floor: property.type === PropertyType.APARTMENT ? (property as any).floor : undefined,
              yearBuilt: undefined, // Not in new structure
              energyClass: property.buildingProperties?.energyEfficiencyClass,
              street: property.address.street,
              city: property.address.city,
              zipCode: property.address.postalCode,
              country: property.address.country,
            });
          }
        }
      } catch (error) {
         console.error('Failed to fetch property:', error);
      }
    };

    loadExistingProperty(id);
  }, [isEditMode, id, form]);

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      if (isEditMode && id) {
        const response = await propertyService.patchProperty(parseInt(id), {...data, id: parseInt(id)});
      } else {
        const response = await newPropertyObject(data);
      }

      toast({
        title: isEditMode ? 'Nemovitost upravena' : 'Nemovitost přidána',
        description: `Nemovitost "${data.title}" byla úspěšně ${isEditMode ? 'upravena' : 'přidána'}.`,
      });
    } catch (error) {
      toast({
        title: `Chyba při ${isEditMode ? 'úpravě' : 'přidávání'} nemovitosti.`,
        variant: 'destructive',
      });
    }

    // Navigate back to properties list
    navigate('/properties');
  };

  const typeLabels = {
    [PropertyType.APARTMENT]: 'Byt',
    [PropertyType.HOUSE]: 'Dům',
    [PropertyType.LAND]: 'Pozemek',
  };

  const statusLabels = {
    [PropertyStatus.AVAILABLE]: 'Dostupné',
    [PropertyStatus.RESERVED]: 'Rezervováno',
    [PropertyStatus.BOUGHT]: 'Prodáno',
  };

  const transactionLabels = {
    [TransactionType.SALE]: 'Prodej',
    [TransactionType.RENTAL]: 'Pronájem',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Upravit nemovitost' : 'Přidat novou nemovitost'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Upravte údaje o nemovitosti' : 'Vyplňte formulář pro přidání nemovitosti'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
              <CardDescription>Základní údaje o nemovitosti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nadpis *</FormLabel>
                    <FormControl>
                      <Input placeholder="např. Moderní byt 3+kk v centru Prahy" {...field} />
                    </FormControl>
                    <FormDescription>
                      Stručný a výstižný název nemovitosti
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Popis *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailní popis nemovitosti..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Podrobný popis nemovitosti, její vybavení a výhody
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte typ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(typeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stav *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte stav" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ transakce *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte typ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(transactionLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena (Kč) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="např. 5000000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Cena v Kč (prodej) nebo měsíční nájemné (pronájem)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detaily nemovitosti</CardTitle>
              <CardDescription>Technické parametry a dispozice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Velikost (m²) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="např. 85" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet pokojů *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="např. 3" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet ložnic *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="např. 2" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet koupelen *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="např. 1" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Podlaží</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="např. 4" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rok výstavby</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="např. 2020" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="energyClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energetická třída</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte třídu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adresa</CardTitle>
              <CardDescription>Lokace nemovitosti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ulice a číslo popisné *</FormLabel>
                    <FormControl>
                      <Input placeholder="např. Hlavní 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Město *</FormLabel>
                      <FormControl>
                        <Input placeholder="např. Praha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PSČ *</FormLabel>
                      <FormControl>
                        <Input placeholder="např. 110 00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Země *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/properties')}>
              Zrušit
            </Button>
            <Button type="submit">
              {isEditMode ? 'Uložit změny' : 'Přidat nemovitost'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PropertyFormPage;
