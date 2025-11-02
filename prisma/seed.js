import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.vehicleBookingLog.deleteMany({});
    await prisma.billPayment.deleteMany({});
    await prisma.vehicleBookingBill.deleteMany({});
    await prisma.vehicleBooking.deleteMany({});
    await prisma.vehicleAvailabilityHistory.deleteMany({});
    await prisma.vehicleRepository.deleteMany({});
    await prisma.vehicleInspection.deleteMany({});
    await prisma.vehicleFeature.deleteMany({});
    await prisma.vehiclePrice.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.providerDocument.deleteMany({});
    await prisma.customerDocument.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.variant.deleteMany({});
    await prisma.model.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.provider.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.otp.deleteMany({});
    await prisma.checklistItem.deleteMany({});
    await prisma.checklistCategory.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.state.deleteMany({});
    console.log("✅ Cleared existing data\n");

    // 1. Create States
    console.log("📍 Creating States...");
    const states = await prisma.state.createMany({
      data: [
        { name: "Maharashtra", code: "MH", active: true },
        { name: "Karnataka", code: "KA", active: true },
        { name: "Tamil Nadu", code: "TN", active: true },
        { name: "Delhi", code: "DL", active: true },
        { name: "Uttar Pradesh", code: "UP", active: true },
      ],
    });
    const stateRecords = await prisma.state.findMany();
    console.log(`✅ Created ${stateRecords.length} states\n`);

    // 2. Create Cities
    console.log("🏙️  Creating Cities...");
    const maharashtraState = stateRecords.find((s) => s.code === "MH");
    const karnatakaState = stateRecords.find((s) => s.code === "KA");
    const tamilnaduState = stateRecords.find((s) => s.code === "TN");

    await prisma.city.createMany({
      data: [
        { name: "Mumbai", stateId: maharashtraState.id, pincode: "400001" },
        { name: "Pune", stateId: maharashtraState.id, pincode: "411001" },
        { name: "Bangalore", stateId: karnatakaState.id, pincode: "560001" },
        { name: "Chennai", stateId: tamilnaduState.id, pincode: "600001" },
        { name: "Hyderabad", stateId: karnatakaState.id, pincode: "500001" },
      ],
    });
    const cityRecords = await prisma.city.findMany();
    console.log(`✅ Created ${cityRecords.length} cities\n`);

    // 3. Create Brands
    console.log("🚗 Creating Vehicle Brands...");
    const brands = await prisma.brand.createMany({
      data: [
        { name: "Honda", logo: "https://www.carlogos.org/logo/Honda-logo-2000x2000.png", active: true },
        { name: "Toyota", logo: "https://www.carlogos.org/logo/Toyota-logo-2000x2000.png", active: true },
        { name: "Maruti", logo: "https://www.carlogos.org/logo/Maruti-Suzuki-logo-2000x2000.png", active: true },
        { name: "Hyundai", logo: "https://www.carlogos.org/logo/Hyundai-logo-2000x2000.png", active: true },
        { name: "BMW", logo: "https://www.carlogos.org/logo/BMW-logo-2000x2000.png", active: true },
      ],
    });
    const brandRecords = await prisma.brand.findMany();
    console.log(`✅ Created ${brandRecords.length} brands\n`);

    // 4. Create Models
    console.log("🏎️  Creating Vehicle Models...");
    const hondaBrand = brandRecords.find((b) => b.name === "Honda");
    const toyotaBrand = brandRecords.find((b) => b.name === "Toyota");
    const marutiBrand = brandRecords.find((b) => b.name === "Maruti");

    const models = await prisma.model.createMany({
      data: [
        { name: "City", brandId: hondaBrand.id, active: true },
        { name: "Accord", brandId: hondaBrand.id, active: true },
        { name: "Innova", brandId: toyotaBrand.id, active: true },
        { name: "Fortuner", brandId: toyotaBrand.id, active: true },
        { name: "Swift", brandId: marutiBrand.id, active: true },
        { name: "Baleno", brandId: marutiBrand.id, active: true },
      ],
    });
    const modelRecords = await prisma.model.findMany();
    console.log(`✅ Created ${modelRecords.length} models\n`);

    // 5. Create Variants
    console.log("🎨 Creating Vehicle Variants...");
    const cityModel = modelRecords.find((m) => m.name === "City");
    const innovaModel = modelRecords.find((m) => m.name === "Innova");
    const swiftModel = modelRecords.find((m) => m.name === "Swift");

    await prisma.variant.createMany({
      data: [
        {
          name: "Manual",
          modelId: cityModel.id,
          fuelType: "Petrol",
          transmission: "Manual",
          seatingCapacity: 5,
          active: true,
        },
        {
          name: "Automatic",
          modelId: cityModel.id,
          fuelType: "Petrol",
          transmission: "Automatic",
          seatingCapacity: 5,
          active: true,
        },
        {
          name: "Standard",
          modelId: innovaModel.id,
          fuelType: "Diesel",
          transmission: "Manual",
          seatingCapacity: 8,
          active: true,
        },
        {
          name: "Premium",
          modelId: innovaModel.id,
          fuelType: "Diesel",
          transmission: "Automatic",
          seatingCapacity: 8,
          active: true,
        },
        {
          name: "Base",
          modelId: swiftModel.id,
          fuelType: "Petrol",
          transmission: "Manual",
          seatingCapacity: 5,
          active: true,
        },
        {
          name: "VXi",
          modelId: swiftModel.id,
          fuelType: "Petrol",
          transmission: "Automatic",
          seatingCapacity: 5,
          active: true,
        },
      ],
    });
    const variantRecords = await prisma.variant.findMany();
    console.log(`✅ Created ${variantRecords.length} variants\n`);

    // 6. Create Documents
    console.log("📄 Creating Documents...");
    await prisma.document.createMany({
      data: [
        {
          name: "PAN Card",
          description: "PAN Card for identification",
          forProvider: true,
          forCustomer: true,
          active: true,
        },
        {
          name: "Aadhar Card",
          description: "Aadhar Card for verification",
          forProvider: true,
          forCustomer: true,
          active: true,
        },
        {
          name: "Driving License",
          description: "Valid Driving License",
          forProvider: false,
          forCustomer: true,
          active: true,
        },
        {
          name: "Insurance Certificate",
          description: "Vehicle Insurance Certificate",
          forProvider: true,
          forCustomer: false,
          active: true,
        },
        {
          name: "RC Book",
          description: "Vehicle Registration Certificate",
          forProvider: true,
          forCustomer: false,
          active: true,
        },
      ],
    });
    const documentRecords = await prisma.document.findMany();
    console.log(`✅ Created ${documentRecords.length} documents\n`);

    // 7. Create Providers
    console.log("👨‍💼 Creating Providers...");
    const mumbaiCity = cityRecords.find((c) => c.name === "Mumbai");
    const providers = [];
    for (let i = 1; i <= 10; i++) {
      const provider = await prisma.provider.create({
        data: {
          name: `Provider ${i}`,
          email: `provider${i}@example.com`,
          mobile: `9${String(i).padStart(9, "0")}`,
          alternateMobile: `8${String(i).padStart(9, "0")}`,
          address: `${i} Main Street, Business District`,
          cityId: mumbaiCity.id,
          stateId: maharashtraState.id,
          zipcode: "400001",
          mobileOTP: `${String(100000 + i).slice(0, 6)}`,
          emailOTP: `${String(100000 + i + 10).slice(0, 6)}`,
          registrationStatus: i <= 5 ? "APPROVED" : "PENDING",
          is_active: true,
        },
      });
      providers.push(provider);
    }
    console.log(`✅ Created ${providers.length} providers\n`);

    // 8. Create Provider Documents
    console.log("📋 Creating Provider Documents...");
    const panDoc = documentRecords.find((d) => d.name === "PAN Card");
    const aadharDoc = documentRecords.find((d) => d.name === "Aadhar Card");
    for (let i = 0; i < providers.length; i++) {
      await prisma.providerDocument.createMany({
        data: [
          {
            providerId: providers[i].id,
            documentId: panDoc.id,
            fileUrl: `https://example.com/pan${i}.jpg`,
            isVerified: i <= 5,
          },
          {
            providerId: providers[i].id,
            documentId: aadharDoc.id,
            fileUrl: `https://example.com/aadhar${i}.jpg`,
            isVerified: i <= 5,
          },
        ],
      });
    }
    console.log(`✅ Created provider documents\n`);

    // 9. Create Users
    console.log("👤 Creating Users...");
    const users = [];
    
    // Create admin user with bcrypt hashed password
    const hashedPassword = await bcrypt.hash("password", 10);
    const adminUser = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        mobile: "9000000000",
        password: hashedPassword,
        role: "ADMIN",
        is_active: true,
        emailVerified: true,
        mobileVerified: true,
      },
    });
    users.push(adminUser);
    console.log("✅ Created admin user");
    
    // Create regular users
    for (let i = 1; i <= 15; i++) {
      const user = await prisma.user.create({
        data: {
          name: `User ${i}`,
          email: `user${i}@example.com`,
          mobile: `7${String(i).padStart(9, "0")}`,
          password: `hashedpassword${i}`,
          role: i % 3 === 0 ? "DRIVER" : "USER",
          is_active: true,
          emailVerified: true,
          mobileVerified: true,
        },
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users total\n`);

    // 10. Create Customers
    console.log("🛍️  Creating Customers...");
    const customers = [];
    const bangaloreCity = cityRecords.find((c) => c.name === "Bangalore");
    const chennaiBranch = cityRecords.find((c) => c.name === "Chennai");

    for (let i = 1; i <= 12; i++) {
      const customer = await prisma.customer.create({
        data: {
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          mobile: `6${String(i).padStart(9, "0")}`,
          alternateMobile: `5${String(i).padStart(9, "0")}`,
          address: `${i} Customer Street`,
          stateId: i <= 6 ? maharashtraState.id : karnatakaState.id,
          cityId: i <= 6 ? mumbaiCity.id : bangaloreCity.id,
          pincode: i <= 6 ? "400001" : "560001",
          aadharNumber: `${String(i).padStart(12, "1")}`,
          aadharFrontPic: `https://example.com/aadhar-front${i}.jpg`,
          aadharBackPic: `https://example.com/aadhar-back${i}.jpg`,
          panNumber: `PAN${i}`,
          panPic: `https://example.com/pan${i}.jpg`,
          profilePic: `https://example.com/profile${i}.jpg`,
          isActive: true,
        },
      });
      customers.push(customer);
    }
    console.log(`✅ Created ${customers.length} customers\n`);

    // 11. Create Customer Documents
    console.log("📝 Creating Customer Documents...");
    const drivingLicenseDoc = documentRecords.find(
      (d) => d.name === "Driving License"
    );
    for (let i = 0; i < customers.length; i++) {
      await prisma.customerDocument.create({
        data: {
          userId: users[i % users.length].id,
          documentId: drivingLicenseDoc.id,
          fileUrl: `https://example.com/dl${i}.jpg`,
          isVerified: i <= 8,
        },
      });
    }
    console.log(`✅ Created customer documents\n`);

    // 12. Create Vehicles
    console.log("🚙 Creating Vehicles...");
    const vehicles = [];
    for (let i = 1; i <= 15; i++) {
      const provider = providers[i % providers.length];
      const brand = brandRecords[i % brandRecords.length];
      const model = modelRecords[i % modelRecords.length];

      const vehicle = await prisma.vehicle.create({
        data: {
          regdNumber: `RJ${String(i).padStart(2, "0")}AB${String(i * 100).padStart(4, "0")}`,
          ownerName: `Owner ${i}`,
          insuranceCompany: ["HDFC", "ICICI", "Bajaj", "Reliance"][
            i % 4
          ],
          insuranceNumber: `INS${String(i).padStart(6, "0")}`,
          chassisNumber: `CHASSIS${String(i).padStart(6, "0")}`,
          rcPic: `https://example.com/rc${i}.jpg`,
          insurancePic: `https://example.com/insurance${i}.jpg`,
          providerId: provider.id,
          brandId: brand.id,
          modelId: model.id,
          variantId: variantRecords[i % variantRecords.length].id,
          workStatus: i % 3 === 0 ? "MAINTENANCE" : "ACTIVE",
          runKm: i * 1000 + Math.floor(Math.random() * 10000),
          color: ["Red", "Blue", "Black", "White", "Silver"][i % 5],
          mileage: 12 + i,
          engineCapacity: "1500cc",
        },
      });
      vehicles.push(vehicle);
    }
    console.log(`✅ Created ${vehicles.length} vehicles\n`);

    // 13. Create Vehicle Features
    console.log("⭐ Creating Vehicle Features...");
    const features = [
      "ABS",
      "Power Steering",
      "AC",
      "Touchscreen",
      "Bluetooth",
      "WiFi",
      "USB Charging",
      "Sunroof",
    ];
    for (let i = 0; i < vehicles.length; i++) {
      for (let j = 0; j < 3; j++) {
        await prisma.vehicleFeature.create({
          data: {
            vehicleId: vehicles[i].id,
            featureName: features[(i + j) % features.length],
          },
        });
      }
    }
    console.log(`✅ Created vehicle features\n`);

    // 14. Create Checklist Categories
    console.log("✔️  Creating Checklist Categories...");
    const categories = await prisma.checklistCategory.createMany({
      data: [
        {
          name: "Exterior",
          description: "Check vehicle exterior condition",
          active: true,
        },
        {
          name: "Interior",
          description: "Check vehicle interior condition",
          active: true,
        },
        {
          name: "Mechanical",
          description: "Check mechanical parts",
          active: true,
        },
        {
          name: "Electrical",
          description: "Check electrical systems",
          active: true,
        },
        {
          name: "Fluids",
          description: "Check fluid levels",
          active: true,
        },
      ],
    });
    const categoryRecords = await prisma.checklistCategory.findMany();
    console.log(`✅ Created ${categoryRecords.length} checklist categories\n`);

    // 15. Create Checklist Items
    console.log("📌 Creating Checklist Items...");
    const exteriorCategory = categoryRecords.find(
      (c) => c.name === "Exterior"
    );
    const mechanicalCategory = categoryRecords.find(
      (c) => c.name === "Mechanical"
    );

    await prisma.checklistItem.createMany({
      data: [
        {
          name: "Paint Condition",
          categoryId: exteriorCategory.id,
          description: "Check paint condition",
          checkType: "visual",
          required: true,
          active: true,
        },
        {
          name: "Tire Condition",
          categoryId: exteriorCategory.id,
          description: "Check tire tread and pressure",
          checkType: "measurement",
          required: true,
          active: true,
        },
        {
          name: "Engine Oil",
          categoryId: mechanicalCategory.id,
          description: "Check engine oil level",
          checkType: "measurement",
          required: true,
          active: true,
        },
        {
          name: "Brakes",
          categoryId: mechanicalCategory.id,
          description: "Check brake condition",
          checkType: "functional",
          required: true,
          active: true,
        },
        {
          name: "Suspension",
          categoryId: mechanicalCategory.id,
          description: "Check suspension system",
          checkType: "visual",
          required: false,
          active: true,
        },
      ],
    });
    console.log(`✅ Created checklist items\n`);

    // 16. Create Vehicle Inspections
    console.log("🔍 Creating Vehicle Inspections...");
    const checklistItems = await prisma.checklistItem.findMany();
    const paintItem = checklistItems.find((i) => i.name === "Paint Condition");

    for (let i = 0; i < vehicles.length; i++) {
      await prisma.vehicleInspection.create({
        data: {
          vehicleId: vehicles[i].id,
          checklistOptionId: paintItem.id,
          rating: 3 + Math.floor(Math.random() * 3),
          description: `Inspection notes for vehicle ${i}`,
          inspectedBy: `Inspector ${i % 5}`,
          inspectedOn: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log(`✅ Created vehicle inspections\n`);

    // 17. Create Vehicle Prices
    console.log("💰 Creating Vehicle Prices...");
    for (let i = 0; i < vehicles.length; i++) {
      await prisma.vehiclePrice.create({
        data: {
          vehicleId: vehicles[i].id,
          basePrice: 2000 + i * 500,
          kmIncluded: 100,
          extraKmRate: 10,
          perHourRate: 250 + i * 20,
          perDayRate: 2000 + i * 500,
          unlimitedAllow: i % 3 === 0,
        },
      });
    }
    console.log(`✅ Created vehicle prices\n`);

    // 18. Create Vehicle Repositories
    console.log("🏢 Creating Vehicle Repositories...");
    for (let i = 0; i < vehicles.length; i++) {
      if (i % 2 === 0) {
        await prisma.vehicleRepository.create({
          data: {
            vehicleId: vehicles[i].id,
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    console.log(`✅ Created vehicle repositories\n`);

    // 19. Create Vehicle Availability Histories
    console.log("📅 Creating Vehicle Availability Histories...");
    for (let i = 0; i < vehicles.length; i++) {
      await prisma.vehicleAvailabilityHistory.create({
        data: {
          vehicleId: vehicles[i].id,
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endTime: new Date(),
        },
      });
    }
    console.log(`✅ Created vehicle availability histories\n`);

    // 20. Create Vehicle Bookings
    console.log("🎫 Creating Vehicle Bookings...");
    const bookings = [];
    for (let i = 0; i < 16; i++) {
      const startDate = new Date(
        Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
      );
      const endDate = new Date(
        startDate.getTime() + (3 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000
      );

      const booking = await prisma.vehicleBooking.create({
        data: {
          vehicleId: vehicles[i % vehicles.length].id,
          customerId: customers[i % customers.length].id,
          bookingNumber: `BK${String(i + 1).padStart(6, "0")}`,
          startTime: startDate,
          endTime: endDate,
          price: (2000 + i * 300) *
            Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
          bookingStatus: [
            "PENDING",
            "CONFIRMED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
          ][i % 5],
        },
      });
      bookings.push(booking);
    }
    console.log(`✅ Created ${bookings.length} vehicle bookings\n`);

    // 21. Create Vehicle Booking Bills
    console.log("💳 Creating Vehicle Booking Bills...");
    const bills = [];
    for (let i = 0; i < bookings.length; i++) {
      const bill = await prisma.vehicleBookingBill.create({
        data: {
          bookingId: bookings[i].id,
          customerId: bookings[i].customerId,
          billAmount: bookings[i].price,
          extraKmPrice:
            bookings[i].bookingStatus === "COMPLETED"
              ? Math.floor(Math.random() * 500)
              : null,
          totalPrice: bookings[i].price + (Math.floor(Math.random() * 500) || 0),
          // paymentId will be set when payment is created
        },
      });
      bills.push(bill);
    }
    console.log(`✅ Created ${bills.length} vehicle booking bills\n`);

    // 22. Create Bill Payments
    console.log("💸 Creating Bill Payments...");
    for (let i = 0; i < bills.length; i++) {
      if (i % 2 === 0) {
        await prisma.billPayment.create({
          data: {
            billId: bills[i].id,
            paymentMode: ["Credit Card", "Debit Card", "UPI", "Cash"][
              i % 4
            ],
            amount: bills[i].totalPrice,
          },
        });
      }
    }
    console.log(`✅ Created bill payments\n`);

    // 23. Create Vehicle Booking Logs
    console.log("📊 Creating Vehicle Booking Logs...");
    for (let i = 0; i < bookings.length; i++) {
      await prisma.vehicleBookingLog.create({
        data: {
          vehicleId: bookings[i].vehicleId,
          bookingId: bookings[i].id,
          bookingNumber: bookings[i].bookingNumber,
          customerId: bookings[i].customerId,
          startTime: bookings[i].startTime,
          endTime: bookings[i].endTime,
          bookingStatus: bookings[i].bookingStatus,
          loggedTime: new Date(),
        },
      });
    }
    console.log(`✅ Created vehicle booking logs\n`);

    // 24. Create OTPs
    console.log("🔐 Creating OTPs...");
    await prisma.otp.createMany({
      data: [
        {
          mobile: "9000000001",
          email: null,
          otp: "123456",
          type: "PHONE",
          is_used: false,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
        },
        {
          mobile: null,
          email: "test@example.com",
          otp: "654321",
          type: "EMAIL",
          is_used: false,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
        },
        {
          mobile: "9000000002",
          email: "provider1@example.com",
          otp: "111111",
          type: "BOTH",
          is_used: true,
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
          verified_at: new Date(),
        },
      ],
    });
    console.log(`✅ Created OTPs\n`);

    console.log(
      "✨ Database seeding completed successfully with the following summary:"
    );
    console.log(`
    📊 Data Summary:
    ├─ States: ${(await prisma.state.count())}
    ├─ Cities: ${(await prisma.city.count())}
    ├─ Brands: ${(await prisma.brand.count())}
    ├─ Models: ${(await prisma.model.count())}
    ├─ Variants: ${(await prisma.variant.count())}
    ├─ Documents: ${(await prisma.document.count())}
    ├─ Providers: ${(await prisma.provider.count())}
    ├─ Provider Documents: ${(await prisma.providerDocument.count())}
    ├─ Users: ${(await prisma.user.count())}
    ├─ Customers: ${(await prisma.customer.count())}
    ├─ Customer Documents: ${(await prisma.customerDocument.count())}
    ├─ Vehicles: ${(await prisma.vehicle.count())}
    ├─ Vehicle Features: ${(await prisma.vehicleFeature.count())}
    ├─ Checklist Categories: ${(await prisma.checklistCategory.count())}
    ├─ Checklist Items: ${(await prisma.checklistItem.count())}
    ├─ Vehicle Inspections: ${(await prisma.vehicleInspection.count())}
    ├─ Vehicle Prices: ${(await prisma.vehiclePrice.count())}
    ├─ Vehicle Repositories: ${(await prisma.vehicleRepository.count())}
    ├─ Vehicle Availability Histories: ${(await prisma.vehicleAvailabilityHistory.count())}
    ├─ Vehicle Bookings: ${(await prisma.vehicleBooking.count())}
    ├─ Vehicle Booking Bills: ${(await prisma.vehicleBookingBill.count())}
    ├─ Bill Payments: ${(await prisma.billPayment.count())}
    ├─ Vehicle Booking Logs: ${(await prisma.vehicleBookingLog.count())}
    └─ OTPs: ${(await prisma.otp.count())}
    `);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();