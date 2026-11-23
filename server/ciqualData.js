// CIQUAL - Table de composition nutritionnelle des aliments (ANSES / CIQUAL France)
// Référentiel des aliments et plats courants avec valeurs moyennes pour 100 g

export const CIQUAL_DATABASE = [
  // Viandes, Poissons, Œufs
  { code: 'VI01', name: 'Blanc de poulet cuit', category: 'Viandes', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0 },
  { code: 'VI02', name: 'Steak haché 5% MG cuit', category: 'Viandes', calories: 135, protein: 21.5, carbs: 0.0, fat: 5.0, fiber: 0.0 },
  { code: 'VI03', name: 'Steak haché 15% MG cuit', category: 'Viandes', calories: 215, protein: 19.5, carbs: 0.0, fat: 15.0, fiber: 0.0 },
  { code: 'VI04', name: 'Escalope de dinde rôtie', category: 'Viandes', calories: 147, protein: 29.0, carbs: 0.0, fat: 3.0, fiber: 0.0 },
  { code: 'VI05', name: 'Filet de bœuf grillé', category: 'Viandes', calories: 180, protein: 26.0, carbs: 0.0, fat: 8.5, fiber: 0.0 },
  { code: 'VI06', name: 'Côte de porc grillée', category: 'Viandes', calories: 230, protein: 24.0, carbs: 0.0, fat: 14.5, fiber: 0.0 },
  { code: 'VI07', name: 'Jambon blanc cuit supérieur', category: 'Viandes', calories: 115, protein: 20.0, carbs: 0.8, fat: 3.5, fiber: 0.0 },
  { code: 'PO01', name: 'Pavé de saumon atlantique cuit', category: 'Poissons', calories: 206, protein: 22.0, carbs: 0.0, fat: 13.0, fiber: 0.0 },
  { code: 'PO02', name: 'Filet de cabillaud vapeur', category: 'Poissons', calories: 78, protein: 18.0, carbs: 0.0, fat: 0.7, fiber: 0.0 },
  { code: 'PO03', name: 'Thon au naturel égoutté', category: 'Poissons', calories: 110, protein: 25.5, carbs: 0.0, fat: 0.8, fiber: 0.0 },
  { code: 'PO04', name: 'Sardines à l’huile d’olive égouttées', category: 'Poissons', calories: 208, protein: 24.0, carbs: 0.0, fat: 12.0, fiber: 0.0 },
  { code: 'PO05', name: 'Crevettes cuites décortiquées', category: 'Poissons', calories: 95, protein: 21.0, carbs: 0.5, fat: 1.0, fiber: 0.0 },
  { code: 'OE01', name: 'Œuf entier poché / dur', category: 'Œufs', calories: 154, protein: 12.6, carbs: 0.8, fat: 11.2, fiber: 0.0 },
  { code: 'OE02', name: 'Omelette nature aux herbes', category: 'Œufs', calories: 160, protein: 11.8, carbs: 0.9, fat: 12.5, fiber: 0.2 },
  { code: 'OE03', name: 'Blanc d’œuf cuit', category: 'Œufs', calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0.0 },

  // Féculents, Céréales & Légumineuses
  { code: 'FE01', name: 'Riz blanc basmati cuit', category: 'Féculents', calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.4 },
  { code: 'FE02', name: 'Riz complet brun cuit', category: 'Féculents', calories: 123, protein: 2.7, carbs: 25.5, fat: 1.0, fiber: 1.8 },
  { code: 'FE03', name: 'Pâtes blanches cuites (al dente)', category: 'Féculents', calories: 145, protein: 5.0, carbs: 29.0, fat: 0.6, fiber: 1.8 },
  { code: 'FE04', name: 'Pâtes complètes cuites', category: 'Féculents', calories: 135, protein: 5.5, carbs: 26.0, fat: 1.0, fiber: 3.5 },
  { code: 'FE05', name: 'Quinoa cuit', category: 'Féculents', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { code: 'FE06', name: 'Semoule de couscous cuite', category: 'Féculents', calories: 140, protein: 4.5, carbs: 28.5, fat: 0.4, fiber: 1.4 },
  { code: 'FE07', name: 'Pomme de terre vapeur / bouillie', category: 'Féculents', calories: 86, protein: 1.9, carbs: 18.5, fat: 0.1, fiber: 1.8 },
  { code: 'FE08', name: 'Frites de pomme de terre au four', category: 'Féculents', calories: 195, protein: 3.0, carbs: 32.0, fat: 6.0, fiber: 3.2 },
  { code: 'FE09', name: 'Patate douce rôtie', category: 'Féculents', calories: 90, protein: 2.0, carbs: 20.5, fat: 0.15, fiber: 3.0 },
  { code: 'FE10', name: 'Lentilles vertes cuites', category: 'Légumineuses', calories: 115, protein: 9.0, carbs: 16.5, fat: 0.6, fiber: 5.0 },
  { code: 'FE11', name: 'Pois chiches cuits', category: 'Légumineuses', calories: 140, protein: 8.5, carbs: 20.0, fat: 2.5, fiber: 5.5 },
  { code: 'FE12', name: 'Haricots rouges cuits', category: 'Légumineuses', calories: 125, protein: 8.7, carbs: 18.0, fat: 0.8, fiber: 6.4 },
  { code: 'FE13', name: 'Flocons d’avoine bio', category: 'Céréales', calories: 375, protein: 14.0, carbs: 60.0, fat: 7.0, fiber: 10.0 },
  { code: 'FE14', name: 'Pain complet au levain', category: 'Pains', calories: 247, protein: 9.5, carbs: 46.0, fat: 1.8, fiber: 7.0 },
  { code: 'FE15', name: 'Baguette de tradition française', category: 'Pains', calories: 275, protein: 8.8, carbs: 55.0, fat: 1.2, fiber: 3.0 },
  { code: 'FE16', name: 'Pain de mie complet', category: 'Pains', calories: 250, protein: 9.0, carbs: 45.0, fat: 3.5, fiber: 6.0 },

  // Légumes & Salades
  { code: 'LE01', name: 'Brocoli vapeur', category: 'Légumes', calories: 35, protein: 2.8, carbs: 4.5, fat: 0.4, fiber: 3.3 },
  { code: 'LE02', name: 'Haricots verts extra-fins cuits', category: 'Légumes', calories: 32, protein: 1.9, carbs: 4.8, fat: 0.2, fiber: 3.0 },
  { code: 'LE03', name: 'Salade verte (mâche, roquette, batavia)', category: 'Légumes', calories: 18, protein: 1.6, carbs: 2.0, fat: 0.3, fiber: 1.8 },
  { code: 'LE04', name: 'Tomate fraîche de saison', category: 'Légumes', calories: 19, protein: 0.9, carbs: 3.1, fat: 0.2, fiber: 1.2 },
  { code: 'LE05', name: 'Concombre frais avec peau', category: 'Légumes', calories: 14, protein: 0.7, carbs: 2.2, fat: 0.1, fiber: 0.9 },
  { code: 'LE06', name: 'Courgette poêlée sans excès d’huile', category: 'Légumes', calories: 30, protein: 1.5, carbs: 3.5, fat: 1.2, fiber: 1.4 },
  { code: 'LE07', name: 'Carotte râpée / cuite', category: 'Légumes', calories: 36, protein: 0.8, carbs: 7.0, fat: 0.2, fiber: 2.8 },
  { code: 'LE08', name: 'Épinards cuits à la vapeur', category: 'Légumes', calories: 28, protein: 3.0, carbs: 2.5, fat: 0.5, fiber: 2.7 },
  { code: 'LE09', name: 'Champignons de Paris sautés', category: 'Légumes', calories: 28, protein: 3.2, carbs: 2.3, fat: 0.4, fiber: 2.0 },
  { code: 'LE10', name: 'Poivron rouge poêlé', category: 'Légumes', calories: 34, protein: 1.2, carbs: 6.0, fat: 0.3, fiber: 1.9 },
  { code: 'LE11', name: 'Avocat Hass mûr', category: 'Légumes', calories: 160, protein: 2.0, carbs: 8.5, fat: 15.0, fiber: 6.7 },

  // Fruits
  { code: 'FR01', name: 'Pomme fraîche avec peau', category: 'Fruits', calories: 52, protein: 0.3, carbs: 12.5, fat: 0.2, fiber: 2.4 },
  { code: 'FR02', name: 'Banane mûre', category: 'Fruits', calories: 89, protein: 1.1, carbs: 21.0, fat: 0.3, fiber: 2.6 },
  { code: 'FR03', name: 'Fraise fraîche', category: 'Fruits', calories: 35, protein: 0.7, carbs: 6.5, fat: 0.3, fiber: 2.0 },
  { code: 'FR04', name: 'Myrtilles / Baies fraîches', category: 'Fruits', calories: 57, protein: 0.7, carbs: 12.0, fat: 0.3, fiber: 2.4 },
  { code: 'FR05', name: 'Orange douce', category: 'Fruits', calories: 47, protein: 0.9, carbs: 10.0, fat: 0.1, fiber: 2.4 },
  { code: 'FR06', name: 'Kiwi vert frais', category: 'Fruits', calories: 61, protein: 1.1, carbs: 12.0, fat: 0.5, fiber: 3.0 },

  // Produits Laitiers & Fromages
  { code: 'LA01', name: 'Fromage blanc 0% MG', category: 'Laitages', calories: 48, protein: 8.5, carbs: 3.8, fat: 0.1, fiber: 0.0 },
  { code: 'LA02', name: 'Fromage blanc 3% MG', category: 'Laitages', calories: 75, protein: 7.5, carbs: 4.2, fat: 3.2, fiber: 0.0 },
  { code: 'LA03', name: 'Yaourt nature entier', category: 'Laitages', calories: 65, protein: 3.5, carbs: 4.8, fat: 3.6, fiber: 0.0 },
  { code: 'LA04', name: 'Yaourt grec authentique', category: 'Laitages', calories: 115, protein: 9.0, carbs: 3.6, fat: 7.0, fiber: 0.0 },
  { code: 'LA05', name: 'Mozzarella di Bufala', category: 'Fromages', calories: 280, protein: 18.0, carbs: 1.5, fat: 22.0, fiber: 0.0 },
  { code: 'LA06', name: 'Feta AOP au lait de brebis', category: 'Fromages', calories: 265, protein: 14.5, carbs: 1.0, fat: 22.0, fiber: 0.0 },
  { code: 'LA07', name: 'Emmental râpé français', category: 'Fromages', calories: 380, protein: 28.5, carbs: 0.5, fat: 29.5, fiber: 0.0 },
  { code: 'LA08', name: 'Parmesan Reggiano AOP', category: 'Fromages', calories: 392, protein: 33.0, carbs: 0.0, fat: 29.0, fiber: 0.0 },

  // Matières Grasses & Oléagineux
  { code: 'MG01', name: 'Huile d’olive vierge extra', category: 'Matières Grasses', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0 },
  { code: 'MG02', name: 'Beurre doux pasteurisé', category: 'Matières Grasses', calories: 717, protein: 0.8, carbs: 0.6, fat: 81.0, fiber: 0.0 },
  { code: 'MG03', name: 'Amandes décortiquées crues', category: 'Oléagineux', calories: 579, protein: 21.0, carbs: 9.5, fat: 50.0, fiber: 12.5 },
  { code: 'MG04', name: 'Noix de Grenoble', category: 'Oléagineux', calories: 654, protein: 15.0, carbs: 7.0, fat: 65.0, fiber: 6.7 },
  { code: 'MG05', name: 'Beurre de cacahuète 100% pur', category: 'Oléagineux', calories: 588, protein: 25.0, carbs: 13.0, fat: 50.0, fiber: 8.0 },

  // Plats Composés Typiques (Référence CIQUAL / Table Française)
  { code: 'PL01', name: 'Bowl Saumon, Quinoa & Avocat', category: 'Plats Préparés', calories: 155, protein: 8.5, carbs: 12.0, fat: 8.0, fiber: 2.5 },
  { code: 'PL02', name: 'Poulet rôti, Riz basmati & Légumes', category: 'Plats Préparés', calories: 135, protein: 12.0, carbs: 14.5, fat: 3.2, fiber: 1.5 },
  { code: 'PL03', name: 'Pâtes Bolognaise au bœuf maison', category: 'Plats Préparés', calories: 142, protein: 7.5, carbs: 18.0, fat: 4.5, fiber: 1.8 },
  { code: 'PL04', name: 'Quiche Lorraine traditionnelle', category: 'Plats Préparés', calories: 290, protein: 9.5, carbs: 18.5, fat: 20.0, fiber: 1.0 },
  { code: 'PL05', name: 'Pizza Margherita artisanale', category: 'Plats Préparés', calories: 245, protein: 10.0, carbs: 32.0, fat: 8.0, fiber: 2.0 },
  { code: 'PL06', name: 'Couscous Poulet & Légumes', category: 'Plats Préparés', calories: 130, protein: 7.0, carbs: 18.0, fat: 3.5, fiber: 2.2 },
  { code: 'PL07', name: 'Burger bœuf maison (pain, steak, cheddar)', category: 'Plats Préparés', calories: 240, protein: 14.0, carbs: 21.0, fat: 11.0, fiber: 1.5 },
  { code: 'PL08', name: 'Soupe de légumes maison (sans crème)', category: 'Plats Préparés', calories: 35, protein: 1.2, carbs: 6.0, fat: 0.5, fiber: 1.8 }
];

// Helper pour matcher un nom détecté avec l'aliment CIQUAL le plus pertinent
export function matchCiqualFood(query) {
  if (!query) return null;
  const cleanQ = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const terms = cleanQ.split(/\s+/).filter(t => t.length > 2);

  let bestMatch = null;
  let maxScore = 0;

  for (const item of CIQUAL_DATABASE) {
    const cleanName = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let score = 0;

    if (cleanName === cleanQ) score += 100;
    else if (cleanName.includes(cleanQ)) score += 50;
    else if (cleanQ.includes(cleanName)) score += 40;

    for (const term of terms) {
      if (cleanName.includes(term)) score += 15;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  return maxScore >= 15 ? bestMatch : null;
}
