import mongoose from 'mongoose';

const paisSchema = new mongoose.Schema({
    name: {
        common: String,
        official: String,
        nativeName: Object,
    },
    independent: Boolean,
    status: String,
    unMember: Boolean,
    currencies: Object,
    capital: [String],
    region: String,
    subregion: String,
    languages: Object,
    latlng: [Number],
    landlocked: Boolean,
    borders: [String],
    area: Number,
    flag: String,
    maps: Object,
    population: Number,
    gini: Object,
    fifa: String,
    timezones: [String],
    continents: [String],
    flags: Object,
    startOfWeek: String,
    capitalInfo: Object,
    creador: {
      type: String, 
      },
}, { collection: 'Grupo-07' });

const Pais = mongoose.model('Pais', paisSchema);

export default Pais;