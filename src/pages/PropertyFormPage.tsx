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
  CreatePropertyAPIInput, CreateApartmentAPI, CreateHouseAPI, CreateLandAPI,
  Property,
  PropertyType,
  PropertyStatus,
  TransactionType,
  PriceDisclosure,
  Commission,
  Taxes,
  Equipment,
  InternetConnection,
  ConstructionMaterial,
  BuildingCondition,
  EnergyEfficiencyClass,
  BuildingLocation,
  AddressRegion,
  ApartmentOwnershipType,
  HouseType,
  AvailableUtility,
  TransportPossibility,
  CivicAmenity,
} from '@/types';
import imageService from '@/services/imageService';
import { useToast } from '@/hooks/use-toast';
import propertyService from '@/services/propertyService';
import { MultiCheckboxField } from '@/components/MultiCheckboxField';
import { useAuth } from '@/contexts/AuthContext';

const createPropertyAPIPayload = async (data: PropertyFormValues): Promise<CreateApartmentAPI | CreateHouseAPI | CreateLandAPI> => {
  let imageIds: number[] = [];
  if (data.images && data.images.length > 0) {
    const uploadedImages = await imageService.uploadImages(data.images);
    imageIds = uploadedImages.map(img => img.id);
  }

  const basePayload: CreatePropertyAPIInput = {
    type: data.type,
    name: data.title,
    description: data.description,
    status: data.status,
    usableArea: data.size,
    contractType: data.transactionType,
    priceDisclosure: data.priceDisclosure,
    commission: data.commission,
    taxes: data.taxes,
    availableFrom: data.availableFrom?.toISOString(),
    basement: data.basement,
    price: data.price,
    address: {
      street: data.street,
      city: data.city,
      postalCode: data.zipCode,
      country: data.country,
      flatNumber: data.flatNumber,
      region: data.region,
    },
    buildingProperties: {
      constructionMaterial: data.constructionMaterial,
      buildingCondition: data.buildingCondition,
      energyEfficiencyClass: data.energyClass,
      buildingLocation: data.buildingLocation,
      inProtectionZone: data.inProtectionZone,
    },
    equipment: data.equipment,
    utilities: {
      availableUtilities: data.utilities,
      internetConnection: data.internetConnection,
      parkingPlaces: data.parkingPlaces,
    },
    transportPossibilities: {
      possibilities: data.transportPossibilities,
    },
    civicAmenities: {
      amenities: data.civicAmenities,
    },
    images: imageIds.length > 0 ? imageIds : undefined,
  };

  if (data.type === PropertyType.APARTMENT) {
    return {
      ...basePayload,
      ownershipType: data.ownershipType!,
      floor: data.floor || 1,
      totalFloors: data.totalFloors || 1,
      elevator: data.elevator || false,
      balcony: data.balcony || false,
      rooms: data.rooms || 1,
    } as CreateApartmentAPI;
  }

  if (data.type === PropertyType.HOUSE) {
    return {
      ...basePayload,
      plotArea: data.plotArea || data.size,
      houseType: data.houseType!,
      stories: data.stories || 1,
    } as CreateHouseAPI;
  }

  return {
    ...basePayload,
    isForHousing: data.isForHousing || false,
  } as CreateLandAPI;
};

const propertyFormSchema = z.object({
  title: z.string().min(5, 'Nadpis musí mít alespoň 5 znaků').max(100, 'Nadpis je příliš dlouhý'),
  description: z.string().min(20, 'Popis musí mít alespoň 20 znaků').max(1000, 'Popis je příliš dlouhý'),
  price: z.number().min(1, 'Cena musí být větší než 0'),
  type: z.nativeEnum(PropertyType),
  status: z.nativeEnum(PropertyStatus),
  transactionType: z.nativeEnum(TransactionType),
  priceDisclosure: z.nativeEnum(PriceDisclosure),
  commission: z.nativeEnum(Commission),
  taxes: z.nativeEnum(Taxes),
  equipment: z.nativeEnum(Equipment),
  size: z.number().min(1, 'Velikost musí být větší než 0'),
  rooms: z.number().min(0, 'Počet pokojů nemůže být záporný').optional(),
  bedrooms: z.number().min(0, 'Počet ložnic nemůže být záporný').optional(),
  bathrooms: z.number().min(0, 'Počet koupelen nemůže být záporný').optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  basement: z.boolean(),
  availableFrom: z.date().optional(),
  ownershipType: z.nativeEnum(ApartmentOwnershipType).optional(),
  elevator: z.boolean().optional(),
  balcony: z.boolean().optional(),
  plotArea: z.number().min(0).optional(),
  houseType: z.nativeEnum(HouseType).optional(),
  stories: z.number().min(1).optional(),
  isForHousing: z.boolean().optional(),
  constructionMaterial: z.nativeEnum(ConstructionMaterial),
  buildingCondition: z.nativeEnum(BuildingCondition),
  energyClass: z.nativeEnum(EnergyEfficiencyClass),
  buildingLocation: z.nativeEnum(BuildingLocation),
  inProtectionZone: z.boolean(),
  utilities: z.array(z.nativeEnum(AvailableUtility)),
  internetConnection: z.nativeEnum(InternetConnection),
  parkingPlaces: z.number().min(0),
  transportPossibilities: z.array(z.nativeEnum(TransportPossibility)),
  civicAmenities: z.array(z.nativeEnum(CivicAmenity)),
  street: z.string().min(3, 'Ulice musí mít alespoň 3 znaky'),
  city: z.string().min(2, 'Město musí mít alespoň 2 znaky'),
  zipCode: z.string().regex(/^\d{3}\s?\d{2}$/, 'PSČ musí být ve formátu 123 45'),
  country: z.string(),
  flatNumber: z.string().optional(),
  region: z.nativeEnum(AddressRegion),
  images: z.array(z.instanceof(File)).optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const PropertyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
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
      priceDisclosure: PriceDisclosure.NOT_DISCLOSED,
      commission: Commission.INCLUDED,
      taxes: Taxes.INCLUDED,
      equipment: Equipment.UNFURNISHED,
      size: 0,
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0,
      floor: undefined,
      totalFloors: undefined,
      basement: false,
      availableFrom: undefined,
      ownershipType: ApartmentOwnershipType.OWNERSHIP,
      elevator: false,
      balcony: false,
      plotArea: undefined,
      houseType: HouseType.DETACHED,
      stories: 1,
      isForHousing: true,
      constructionMaterial: ConstructionMaterial.BRICK,
      buildingCondition: BuildingCondition.GOOD,
      energyClass: EnergyEfficiencyClass.B,
      buildingLocation: BuildingLocation.CITY_CENTER,
      inProtectionZone: false,
      utilities: [],
      internetConnection: InternetConnection.NONE,
      parkingPlaces: 0,
      transportPossibilities: [],
      civicAmenities: [],
      street: '',
      city: '',
      zipCode: '',
      country: 'Česká republika',
      flatNumber: '',
      region: AddressRegion.PRAHA,
      images: [],
    },
  });

  useEffect(() => {
    const loadExistingProperty = async (id: string | undefined) => {
      try {
        if (isEditMode && id) {
          const property = await propertyService.getProperty(parseInt(id));
          if (property) {
            console.log('Edit mode - property loaded:', property);
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
      if (!user) {
        toast({
          title: 'Chyba',
          description: 'Musíte být přihlášeni pro vytvoření nemovitosti.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      if (user.role !== 'AGENT' && user.role !== 'ADMIN') {
        toast({
          title: 'Nedostatečná oprávnění',
          description: 'Pouze agenti a administrátoři mohou vytvářet nemovitosti.',
          variant: 'destructive',
        });
        return;
      }

      const payload = await createPropertyAPIPayload(data);

      console.log('=== Creating property ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      let response: Property;
      if (isEditMode && id) {
        throw new Error('Edit mode not fully implemented yet');
      } else {
        if (data.type === PropertyType.APARTMENT) {
          response = await propertyService.createApartment(payload as CreateApartmentAPI);
        } else if (data.type === PropertyType.HOUSE) {
          response = await propertyService.createHouse(payload as CreateHouseAPI);
        } else {
          response = await propertyService.createLand(payload as CreateLandAPI);
        }
        console.log('Property created:', response);
      }

      toast({
        title: isEditMode ? 'Nemovitost upravena' : 'Nemovitost přidána',
        description: `Nemovitost "${data.title}" byla úspěšně ${isEditMode ? 'upravena' : 'přidána'}.`,
      });

      navigate('/properties');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Neznámá chyba';

      toast({
        title: `Chyba při ${isEditMode ? 'úpravě' : 'přidávání'} nemovitosti.`,
        description: errorMessage,
        variant: 'destructive',
      });
    }
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
                  name="availableFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dostupné od</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Kdy bude nemovitost k dispozici
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle>Finanční údaje</CardTitle>
              <CardDescription>Informace o ceně a poplatcích</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceDisclosure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Způsob zveřejnění ceny *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte způsob" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PriceDisclosure.ASK}>Na vyžádání</SelectItem>
                          <SelectItem value={PriceDisclosure.AGREEMENT}>Dohodou</SelectItem>
                          <SelectItem value={PriceDisclosure.NOT_DISCLOSED}>Nezveřejněno</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provize *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Commission.INCLUDED}>Zahrnuta</SelectItem>
                          <SelectItem value={Commission.EXCLUDED}>Nezahrnuta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daně *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Taxes.INCLUDED}>Zahrnuty</SelectItem>
                          <SelectItem value={Taxes.EXCLUDED}>Nezahrnuty</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vybavení *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Equipment.FURNISHED}>Zařízeno</SelectItem>
                          <SelectItem value={Equipment.UNFURNISHED}>Nezařízeno</SelectItem>
                          <SelectItem value={Equipment.PARTIALLY_FURNISHED}>Částečně zařízeno</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Building Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Vlastnosti budovy</CardTitle>
              <CardDescription>Technické parametry budovy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="constructionMaterial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materiál stavby *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte materiál" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ConstructionMaterial.BRICK}>Cihla</SelectItem>
                          <SelectItem value={ConstructionMaterial.PANEL}>Panel</SelectItem>
                          <SelectItem value={ConstructionMaterial.WOOD}>Dřevo</SelectItem>
                          <SelectItem value={ConstructionMaterial.STONE}>Kámen</SelectItem>
                          <SelectItem value={ConstructionMaterial.OTHER}>Jiné</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buildingCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stav budovy *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte stav" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BuildingCondition.NEW}>Nová</SelectItem>
                          <SelectItem value={BuildingCondition.RENOVATED}>Zrekonstruovaná</SelectItem>
                          <SelectItem value={BuildingCondition.GOOD}>Dobrý</SelectItem>
                          <SelectItem value={BuildingCondition.NEEDS_RENOVATION}>Vyžaduje rekonstrukci</SelectItem>
                          <SelectItem value={BuildingCondition.DILAPIDATED}>Chátrající</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="energyClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energetická třída *</FormLabel>
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

                <FormField
                  control={form.control}
                  name="buildingLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokace budovy *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte lokaci" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BuildingLocation.CITY_CENTER}>Centrum města</SelectItem>
                          <SelectItem value={BuildingLocation.SUBURBS}>Předměstí</SelectItem>
                          <SelectItem value={BuildingLocation.RURAL_AREA}>Venkov</SelectItem>
                          <SelectItem value={BuildingLocation.QUITE_AREA}>Klidná oblast</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="inProtectionZone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>V ochranném pásmu</FormLabel>
                      <FormDescription>
                        Je nemovitost v ochranném pásmu?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sklep</FormLabel>
                      <FormDescription>
                        Má nemovitost sklep?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
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

              <FormField
                control={form.control}
                name="flatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Číslo bytu</FormLabel>
                    <FormControl>
                      <Input placeholder="např. 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kraj *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte kraj" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={AddressRegion.PRAHA}>Praha</SelectItem>
                          <SelectItem value={AddressRegion.STREDOCESKY}>Středočeský</SelectItem>
                          <SelectItem value={AddressRegion.JIHOCESKY}>Jihočeský</SelectItem>
                          <SelectItem value={AddressRegion.PLZENSKY}>Plzeňský</SelectItem>
                          <SelectItem value={AddressRegion.KARLOVARSKY}>Karlovarský</SelectItem>
                          <SelectItem value={AddressRegion.USTECKY}>Ústecký</SelectItem>
                          <SelectItem value={AddressRegion.LIBERECKY}>Liberecký</SelectItem>
                          <SelectItem value={AddressRegion.KRALOVEHRADECKY}>Královéhradecký</SelectItem>
                          <SelectItem value={AddressRegion.PARDUBICKY}>Pardubický</SelectItem>
                          <SelectItem value={AddressRegion.VYSOCINA}>Vysočina</SelectItem>
                          <SelectItem value={AddressRegion.JIHOMORAVSKY}>Jihomoravský</SelectItem>
                          <SelectItem value={AddressRegion.OLOMOUCKY}>Olomoucký</SelectItem>
                          <SelectItem value={AddressRegion.ZLINSKY}>Zlínský</SelectItem>
                          <SelectItem value={AddressRegion.MORAVSKOSLEZSKY}>Moravskoslezský</SelectItem>
                        </SelectContent>
                      </Select>
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

          {/* Utilities */}
          <Card>
            <CardHeader>
              <CardTitle>Inženýrské sítě</CardTitle>
              <CardDescription>Dostupné utility a připojení</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="utilities"
                render={({ field }) => (
                  <MultiCheckboxField
                    value={field.value}
                    onChange={field.onChange}
                    label="Dostupné utility"
                    options={[
                      { value: AvailableUtility.WATER, label: 'Voda' },
                      { value: AvailableUtility.WELL, label: 'Studna' },
                      { value: AvailableUtility.ELECTRICITY, label: 'Elektřina' },
                      { value: AvailableUtility.GAS, label: 'Plyn' },
                      { value: AvailableUtility.SEWERAGE, label: 'Kanalizace' },
                      { value: AvailableUtility.CESSPOOL, label: 'Žumpa' },
                      { value: AvailableUtility.HEATING, label: 'Topení' },
                      { value: AvailableUtility.PHONE_LINE, label: 'Telefonní linka' },
                      { value: AvailableUtility.CABLE_TV, label: 'Kabelová TV' },
                      { value: AvailableUtility.RECYCLING, label: 'Recyklace' },
                      { value: AvailableUtility.BARRIER_FREE_ACCESS, label: 'Bezbariérový přístup' },
                    ]}
                  />
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="internetConnection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internetové připojení *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte typ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={InternetConnection.NONE}>Žádné</SelectItem>
                          <SelectItem value={InternetConnection.DSL}>DSL</SelectItem>
                          <SelectItem value={InternetConnection.CABLE}>Kabel</SelectItem>
                          <SelectItem value={InternetConnection.FIBER_OPTIC}>Optické vlákno</SelectItem>
                          <SelectItem value={InternetConnection.SATELLITE}>Satelit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parkingPlaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet parkovacích míst *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Transport Possibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Dopravní možnosti</CardTitle>
              <CardDescription>Dostupnost dopravy v okolí</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="transportPossibilities"
                render={({ field }) => (
                  <MultiCheckboxField
                    value={field.value}
                    onChange={field.onChange}
                    label="Dostupná doprava"
                    options={[
                      { value: TransportPossibility.ROAD, label: 'Silnice' },
                      { value: TransportPossibility.HIGHWAY, label: 'Dálnice' },
                      { value: TransportPossibility.TRAIN, label: 'Vlak' },
                      { value: TransportPossibility.BUS, label: 'Autobus' },
                      { value: TransportPossibility.PUBLIC_TRANSPORT, label: 'MHD' },
                      { value: TransportPossibility.AIRPLANE, label: 'Letadlo' },
                      { value: TransportPossibility.BOAT, label: 'Loď' },
                      { value: TransportPossibility.FERRY, label: 'Přívoz' },
                    ]}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Civic Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Občanská vybavenost</CardTitle>
              <CardDescription>Dostupné služby v okolí</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="civicAmenities"
                render={({ field }) => (
                  <MultiCheckboxField
                    value={field.value}
                    onChange={field.onChange}
                    label="Dostupné služby"
                    options={[
                      { value: CivicAmenity.BUS_STOP, label: 'Autobusová zastávka' },
                      { value: CivicAmenity.TRAIN_STATION, label: 'Vlakové nádraží' },
                      { value: CivicAmenity.POST_OFFICE, label: 'Pošta' },
                      { value: CivicAmenity.ATM, label: 'Bankomat' },
                      { value: CivicAmenity.GENERAL_PRACTITIONER, label: 'Praktický lékař' },
                      { value: CivicAmenity.VETERINARIAN, label: 'Veterinář' },
                      { value: CivicAmenity.ELEMENTARY_SCHOOL, label: 'Základní škola' },
                      { value: CivicAmenity.KINDERGARTEN, label: 'Mateřská škola' },
                      { value: CivicAmenity.SUPERMARKET, label: 'Supermarket' },
                      { value: CivicAmenity.SMALL_SHOP, label: 'Malá prodejna' },
                      { value: CivicAmenity.RESTAURANT, label: 'Restaurace' },
                      { value: CivicAmenity.PUB, label: 'Hospoda' },
                      { value: CivicAmenity.PLAYGROUND, label: 'Dětské hřiště' },
                      { value: CivicAmenity.SUBWAY, label: 'Metro' },
                    ]}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Images Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Obrázky</CardTitle>
              <CardDescription>Nahrajte fotografie nemovitosti</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="images"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Fotografie nemovitosti</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          onChange(files);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Můžete nahrát více obrázků najednou (formáty: JPG, PNG). Držte Ctrl (Windows) nebo Cmd (Mac) pro výběr více souborů.
                    </FormDescription>
                    {value && value.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Vybraných obrázků: {value.length}
                        </p>
                        <div className="space-y-1">
                          {value.map((file: File, index: number) => (
                            <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="font-mono">{index + 1}.</span>
                              <span className="truncate">{file.name}</span>
                              <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
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
