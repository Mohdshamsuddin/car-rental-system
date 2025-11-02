import { ProviderDAL } from '../dal/providerDAL.js';
import bcrypt from 'bcryptjs';

export class ProviderService {
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async registerProvider(providerData) {
    const {
      name, email, mobile, password, alternate_mobile,
      address, cityId, stateId, zipcode
    } = providerData;

    if (!name || !email || !mobile || !password ||
        !address || !cityId || !stateId || !zipcode) {
      throw new Error('All required fields must be provided');
    }

    const existingEmailUser = await ProviderDAL.findByEmail(email);
    if (existingEmailUser) throw new Error('Email or Mobile already exists');

    const existingMobileUser = await ProviderDAL.findByMobile(mobile);
    if (existingMobileUser) throw new Error('Email or Mobile already exists');

    if (alternate_mobile) {
      const existingAlternateMobile = await ProviderDAL.findByAlternateMobile(alternate_mobile);
      if (existingAlternateMobile) throw new Error('Email or Mobile already exists');
    }

    const city = await ProviderDAL.findCityById(cityId);
    if (!city) throw new Error('Invalid city selected');
    if (city.stateId !== stateId) throw new Error('City does not belong to the selected state');

    const state = await ProviderDAL.findStateById(stateId);
    if (!state) throw new Error('Invalid state selected');

    const hashedPassword = await bcrypt.hash(password, 10);
    // Store hashedPassword in user/auth service (not here)

    const emailOTP = this.generateOtp();
    const mobileOTP = this.generateOtp();

    const newProvider = await ProviderDAL.createProvider({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      alternate_mobile: alternate_mobile?.trim() || null,
      address: address.trim(),
      cityId,
      stateId,
      zipcode: zipcode.trim(),
      registration_status: "PENDING",
      is_active: false,
      emailOTP,
      mobileOTP,
    });

    // You can add OTP sending logic here (email/SMS notification)

    return newProvider;
  }
}
