export const countries = [
  { code:'CO', name:'Colombia', currency:'COP', locale:'es', flag:'🇨🇴', payments:['PSE','Nequi'] },
  { code:'BR', name:'Brasil', currency:'BRL', locale:'pt', flag:'🇧🇷', payments:['PIX'] },
  { code:'US', name:'United States', currency:'USD', locale:'en', flag:'🇺🇸', payments:['card'] },
  { code:'FR', name:'France', currency:'EUR', locale:'fr', flag:'🇫🇷', payments:['paypal','sepa'] },
  { code:'DE', name:'Deutschland', currency:'EUR', locale:'de', flag:'🇩🇪', payments:['paypal','sepa'] },
];

export const exchangeRates = { USD:1, COP:4150, BRL:5.05, EUR:0.92 };

export const products = [
  {
    id:'p1', category:'superfoods', stock:5, rating:4.8, reviews:124, badge:'bestseller',
    image:'images/p1.jpg',
    prices:{ USD:12.00, COP:48000, BRL:60.00, EUR:11.00 },
    name:{ es:'Cúrcuma Orgánica en Polvo', pt:'Cúrcuma Orgânica em Pó', en:'Organic Turmeric Powder', fr:'Curcuma Bio en Poudre', de:'Bio-Kurkuma Pulver' },
    desc:{ es:'Antiinflamatorio natural de alta pureza. 200g.', pt:'Anti-inflamatório natural de alta pureza. 200g.', en:'High-purity natural anti-inflammatory. 200g.', fr:'Anti-inflammatoire naturel haute pureté. 200g.', de:'Natürliches entzündungshemmendes Mittel. 200g.' }
  },
  {
    id:'p2', category:'supplements', stock:12, rating:4.6, reviews:89, badge:'new',
    image:'images/p2.jpg',
    prices:{ USD:20.00, COP:80000, BRL:100.00, EUR:18.00 },
    name:{ es:'Extracto de Ashwagandha', pt:'Extrato de Ashwagandha', en:'Ashwagandha Extract', fr:'Extrait d\'Ashwagandha', de:'Ashwagandha-Extrakt' },
    desc:{ es:'Adaptógeno para reducir el estrés. 60 cápsulas.', pt:'Adaptógeno para reduzir o estresse. 60 cápsulas.', en:'Adaptogen for stress relief. 60 capsules.', fr:'Adaptogène anti-stress. 60 capsules.', de:'Adaptogen zur Stressreduktion. 60 Kapseln.' }
  },
  {
    id:'p3', category:'superfoods', stock:8, rating:4.7, reviews:201, badge:'bestseller',
    image:'https://upload.wikimedia.org/wikipedia/commons/b/b3/Spirulina_Powder.jpg',
    prices:{ USD:15.00, COP:60000, BRL:75.00, EUR:14.00 },
    name:{ es:'Tabletas de Espirulina', pt:'Comprimidos de Espirulina', en:'Spirulina Tablets', fr:'Comprimés de Spiruline', de:'Spirulina-Tabletten' },
    desc:{ es:'Superalimento rico en proteínas. 120 tabletas.', pt:'Superalimento rico em proteínas. 120 comprimidos.', en:'Protein-rich superfood. 120 tablets.', fr:'Superaliment riche en protéines. 120 comprimés.', de:'Proteinreiches Superfood. 120 Tabletten.' }
  },
  {
    id:'p4', category:'superfoods', stock:3, rating:4.9, reviews:315, badge:'premium',
    image:'https://upload.wikimedia.org/wikipedia/commons/5/52/Manuka_honey.jpg',
    prices:{ USD:35.00, COP:140000, BRL:175.00, EUR:32.00 },
    name:{ es:'Miel de Manuka Cruda', pt:'Mel de Manuka Cru', en:'Raw Manuka Honey', fr:'Miel de Manuka Cru', de:'Roher Manuka-Honig' },
    desc:{ es:'Miel premium antibacteriana MGO 400+. 250g.', pt:'Mel premium antibacteriano MGO 400+. 250g.', en:'Premium antibacterial honey MGO 400+. 250g.', fr:'Miel premium antibactérien MGO 400+. 250g.', de:'Premium antibakterieller Honig MGO 400+. 250g.' }
  },
  {
    id:'p5', category:'grains', stock:20, rating:4.5, reviews:178, badge:null,
    image:'images/p5.jpg',
    prices:{ USD:8.00, COP:32000, BRL:40.00, EUR:7.50 },
    name:{ es:'Semillas de Chía Orgánicas', pt:'Sementes de Chia Orgânicas', en:'Organic Chia Seeds', fr:'Graines de Chia Bio', de:'Bio-Chiasamen' },
    desc:{ es:'Fuente de omega-3 y fibra. 500g.', pt:'Fonte de ômega-3 e fibra. 500g.', en:'Source of omega-3 and fiber. 500g.', fr:'Source d\'oméga-3 et fibres. 500g.', de:'Quelle von Omega-3 und Ballaststoffen. 500g.' }
  },
  {
    id:'p6', category:'teas', stock:15, rating:4.8, reviews:256, badge:'bestseller',
    image:'https://upload.wikimedia.org/wikipedia/commons/d/d9/Matcha_Scoop.jpg',
    prices:{ USD:25.00, COP:100000, BRL:125.00, EUR:23.00 },
    name:{ es:'Té Matcha Ceremonial', pt:'Chá Matcha Cerimonial', en:'Ceremonial Matcha Tea', fr:'Thé Matcha Cérémonial', de:'Zeremonieller Matcha-Tee' },
    desc:{ es:'Grado ceremonial japonés. 100g.', pt:'Grau cerimonial japonês. 100g.', en:'Japanese ceremonial grade. 100g.', fr:'Grade cérémonial japonais. 100g.', de:'Japanischer Zeremoniengrad. 100g.' }
  },
  {
    id:'p7', category:'oils', stock:10, rating:4.6, reviews:142, badge:null,
    image:'https://upload.wikimedia.org/wikipedia/commons/f/f3/Coconut_and_oil.jpg',
    prices:{ USD:14.00, COP:56000, BRL:70.00, EUR:13.00 },
    name:{ es:'Aceite de Coco Extra Virgen', pt:'Óleo de Coco Extra Virgem', en:'Extra Virgin Coconut Oil', fr:'Huile de Coco Extra Vierge', de:'Natives Kokosöl Extra' },
    desc:{ es:'Prensado en frío, 100% orgánico. 500ml.', pt:'Prensado a frio, 100% orgânico. 500ml.', en:'Cold-pressed, 100% organic. 500ml.', fr:'Pressé à froid, 100% bio. 500ml.', de:'Kaltgepresst, 100% biologisch. 500ml.' }
  },
  {
    id:'p8', category:'care', stock:7, rating:4.4, reviews:93, badge:'new',
    image:'https://upload.wikimedia.org/wikipedia/commons/4/4b/Aloe_vera_flower_inset.png',
    prices:{ USD:10.00, COP:40000, BRL:50.00, EUR:9.50 },
    name:{ es:'Gel de Aloe Vera Puro', pt:'Gel de Aloe Vera Puro', en:'Pure Aloe Vera Gel', fr:'Gel d\'Aloe Vera Pur', de:'Reines Aloe Vera Gel' },
    desc:{ es:'99% aloe vera natural. 300ml.', pt:'99% aloe vera natural. 300ml.', en:'99% natural aloe vera. 300ml.', fr:'99% aloe vera naturel. 300ml.', de:'99% natürliche Aloe Vera. 300ml.' }
  },
  {
    id:'p9', category:'grains', stock:18, rating:4.3, reviews:67, badge:null,
    image:'images/p9.jpg',
    prices:{ USD:6.00, COP:24000, BRL:30.00, EUR:5.50 },
    name:{ es:'Harina de Quinoa', pt:'Farinha de Quinoa', en:'Quinoa Flour', fr:'Farine de Quinoa', de:'Quinoa-Mehl' },
    desc:{ es:'Sin gluten, alto en proteína. 1kg.', pt:'Sem glúten, alto em proteína. 1kg.', en:'Gluten-free, high protein. 1kg.', fr:'Sans gluten, riche en protéines. 1kg.', de:'Glutenfrei, proteinreich. 1kg.' }
  },
  {
    id:'p10', category:'oils', stock:9, rating:4.7, reviews:188, badge:'premium',
    image:'images/p10.jpg',
    prices:{ USD:18.00, COP:72000, BRL:90.00, EUR:16.50 },
    name:{ es:'Aceite Esencial de Lavanda', pt:'Óleo Essencial de Lavanda', en:'Lavender Essential Oil', fr:'Huile Essentielle de Lavande', de:'Lavendel-Ätherisches Öl' },
    desc:{ es:'100% puro, aromaterapia. 30ml.', pt:'100% puro, aromaterapia. 30ml.', en:'100% pure, aromatherapy. 30ml.', fr:'100% pur, aromathérapie. 30ml.', de:'100% rein, Aromatherapie. 30ml.' }
  },
  {
    id:'p11', category:'superfoods', stock:14, rating:4.5, reviews:110, badge:null,
    image:'images/p11.jpg',
    prices:{ USD:16.00, COP:64000, BRL:80.00, EUR:15.00 },
    name:{ es:'Polvo de Moringa', pt:'Pó de Moringa', en:'Moringa Powder', fr:'Poudre de Moringa', de:'Moringa-Pulver' },
    desc:{ es:'Árbol de la vida, 90+ nutrientes. 200g.', pt:'Árvore da vida, 90+ nutrientes. 200g.', en:'Tree of life, 90+ nutrients. 200g.', fr:'Arbre de vie, 90+ nutriments. 200g.', de:'Baum des Lebens, 90+ Nährstoffe. 200g.' }
  },
  {
    id:'p12', category:'supplements', stock:6, rating:4.2, reviews:54, badge:null,
    image:'images/p12.jpg',
    prices:{ USD:12.00, COP:48000, BRL:60.00, EUR:11.00 },
    name:{ es:'Cápsulas de Carbón Activado', pt:'Cápsulas de Carvão Ativado', en:'Activated Charcoal Capsules', fr:'Capsules de Charbon Actif', de:'Aktivkohle-Kapseln' },
    desc:{ es:'Desintoxicación natural. 90 cápsulas.', pt:'Desintoxicação natural. 90 cápsulas.', en:'Natural detox. 90 capsules.', fr:'Détox naturelle. 90 capsules.', de:'Natürliche Entgiftung. 90 Kapseln.' }
  }
];

export const translations = {
  es: {
    brand:'GreenCart', tagline:'Tu tienda naturista de confianza',
    nav_home:'Inicio', nav_products:'Productos', nav_cart:'Carrito', nav_track:'Seguimiento',
    hero_title:'Bienestar Natural,\nEntregado a Tu Puerta', hero_sub:'Productos orgánicos y naturales de la más alta calidad, seleccionados para tu salud.',
    hero_cta:'Explorar Productos', hero_cta2:'Ver Ofertas',
    featured:'Productos Destacados', view_all:'Ver Todo',
    categories:'Categorías', cat_all:'Todos', cat_superfoods:'Superalimentos', cat_supplements:'Suplementos', cat_teas:'Tés', cat_oils:'Aceites', cat_grains:'Granos', cat_care:'Cuidado Personal',
    add_cart:'Agregar al Carrito', buy_now:'Comprar Ahora', added:'¡Agregado!',
    cart_title:'Tu Carrito', cart_empty:'Tu carrito está vacío', cart_subtotal:'Subtotal', cart_total:'Total', cart_checkout:'Finalizar Pedido', cart_continue:'Seguir Comprando', cart_remove:'Eliminar',
    checkout_title:'Checkout', step_shipping:'Envío', step_payment:'Pago', step_confirm:'Confirmar',
    field_name:'Nombre completo', field_email:'Correo electrónico', field_address:'Dirección', field_city:'Ciudad', field_phone:'Teléfono',
    pay_method:'Método de Pago', pay_process:'Procesar Pago', pay_processing:'Procesando...', pay_success:'¡Pago exitoso!', pay_error:'Error en el pago',
    order_confirm:'Confirmar Pedido', order_place:'Realizar Pedido',
    track_title:'Seguimiento de Pedido', track_id:'ID del Pedido', track_search:'Buscar', track_no:'Ingresa tu ID de pedido',
    status_created:'Orden Creada', status_processing:'En Proceso', status_preparing:'Preparando', status_shipped:'Enviado', status_transit:'En Camino', status_delivered:'Entregado', status_returned:'Devuelto',
    reviews_label:'reseñas', stock_low:'¡Últimas unidades!', stock_out:'Agotado',
    badge_bestseller:'Más Vendido', badge_new:'Nuevo', badge_premium:'Premium',
    footer_rights:'Todos los derechos reservados', footer_about:'Sobre Nosotros', footer_contact:'Contacto', footer_privacy:'Privacidad',
    social_proof:'personas compraron esto hoy', loading:'Cargando...', qty:'Cantidad',
    saga_rollback:'Pago fallido. Revirtiendo operación...', saga_stock:'Restaurando inventario...', saga_complete:'Reversión completada.',
    country_label:'País', currency_label:'Moneda', lang_label:'Idioma',
    search:'Buscar productos...', newsletter:'Suscríbete a nuestro boletín', subscribe:'Suscribirse',
    trust_organic:'100% Orgánico', trust_shipping:'Envío Rápido', trust_support:'Soporte 24/7', trust_returns:'Devoluciones Gratis',
    next:'Siguiente', back:'Atrás', close:'Cerrar',
  },
  pt: {
    brand:'GreenCart', tagline:'Sua loja naturista de confiança',
    nav_home:'Início', nav_products:'Produtos', nav_cart:'Carrinho', nav_track:'Rastreamento',
    hero_title:'Bem-estar Natural,\nEntregue à Sua Porta', hero_sub:'Produtos orgânicos e naturais da mais alta qualidade, selecionados para sua saúde.',
    hero_cta:'Explorar Produtos', hero_cta2:'Ver Ofertas',
    featured:'Produtos em Destaque', view_all:'Ver Tudo',
    categories:'Categorias', cat_all:'Todos', cat_superfoods:'Superalimentos', cat_supplements:'Suplementos', cat_teas:'Chás', cat_oils:'Óleos', cat_grains:'Grãos', cat_care:'Cuidado Pessoal',
    add_cart:'Adicionar ao Carrinho', buy_now:'Comprar Agora', added:'Adicionado!',
    cart_title:'Seu Carrinho', cart_empty:'Seu carrinho está vazio', cart_subtotal:'Subtotal', cart_total:'Total', cart_checkout:'Finalizar Pedido', cart_continue:'Continuar Comprando', cart_remove:'Remover',
    checkout_title:'Checkout', step_shipping:'Envio', step_payment:'Pagamento', step_confirm:'Confirmar',
    field_name:'Nome completo', field_email:'E-mail', field_address:'Endereço', field_city:'Cidade', field_phone:'Telefone',
    pay_method:'Método de Pagamento', pay_process:'Processar Pagamento', pay_processing:'Processando...', pay_success:'Pagamento realizado!', pay_error:'Erro no pagamento',
    order_confirm:'Confirmar Pedido', order_place:'Fazer Pedido',
    track_title:'Rastreamento do Pedido', track_id:'ID do Pedido', track_search:'Buscar', track_no:'Insira o ID do pedido',
    status_created:'Pedido Criado', status_processing:'Em Processo', status_preparing:'Preparando', status_shipped:'Enviado', status_transit:'A Caminho', status_delivered:'Entregue', status_returned:'Devolvido',
    reviews_label:'avaliações', stock_low:'Últimas unidades!', stock_out:'Esgotado',
    badge_bestseller:'Mais Vendido', badge_new:'Novo', badge_premium:'Premium',
    footer_rights:'Todos os direitos reservados', footer_about:'Sobre Nós', footer_contact:'Contato', footer_privacy:'Privacidade',
    social_proof:'pessoas compraram isso hoje', loading:'Carregando...', qty:'Quantidade',
    saga_rollback:'Pagamento falhou. Revertendo operação...', saga_stock:'Restaurando estoque...', saga_complete:'Reversão concluída.',
    country_label:'País', currency_label:'Moeda', lang_label:'Idioma',
    search:'Buscar produtos...', newsletter:'Assine nossa newsletter', subscribe:'Assinar',
    trust_organic:'100% Orgânico', trust_shipping:'Envio Rápido', trust_support:'Suporte 24/7', trust_returns:'Devoluções Grátis',
    next:'Próximo', back:'Voltar', close:'Fechar',
  },
  en: {
    brand:'GreenCart', tagline:'Your trusted naturist store',
    nav_home:'Home', nav_products:'Products', nav_cart:'Cart', nav_track:'Tracking',
    hero_title:'Natural Wellness,\nDelivered to Your Door', hero_sub:'Premium organic and natural products, curated for your health and well-being.',
    hero_cta:'Explore Products', hero_cta2:'View Offers',
    featured:'Featured Products', view_all:'View All',
    categories:'Categories', cat_all:'All', cat_superfoods:'Superfoods', cat_supplements:'Supplements', cat_teas:'Teas', cat_oils:'Oils', cat_grains:'Grains', cat_care:'Personal Care',
    add_cart:'Add to Cart', buy_now:'Buy Now', added:'Added!',
    cart_title:'Your Cart', cart_empty:'Your cart is empty', cart_subtotal:'Subtotal', cart_total:'Total', cart_checkout:'Proceed to Checkout', cart_continue:'Continue Shopping', cart_remove:'Remove',
    checkout_title:'Checkout', step_shipping:'Shipping', step_payment:'Payment', step_confirm:'Confirm',
    field_name:'Full Name', field_email:'Email', field_address:'Address', field_city:'City', field_phone:'Phone',
    pay_method:'Payment Method', pay_process:'Process Payment', pay_processing:'Processing...', pay_success:'Payment successful!', pay_error:'Payment failed',
    order_confirm:'Confirm Order', order_place:'Place Order',
    track_title:'Order Tracking', track_id:'Order ID', track_search:'Search', track_no:'Enter your order ID',
    status_created:'Order Created', status_processing:'Processing', status_preparing:'Preparing', status_shipped:'Shipped', status_transit:'In Transit', status_delivered:'Delivered', status_returned:'Returned',
    reviews_label:'reviews', stock_low:'Last units!', stock_out:'Out of Stock',
    badge_bestseller:'Bestseller', badge_new:'New', badge_premium:'Premium',
    footer_rights:'All rights reserved', footer_about:'About Us', footer_contact:'Contact', footer_privacy:'Privacy',
    social_proof:'people bought this today', loading:'Loading...', qty:'Quantity',
    saga_rollback:'Payment failed. Rolling back...', saga_stock:'Restoring inventory...', saga_complete:'Rollback complete.',
    country_label:'Country', currency_label:'Currency', lang_label:'Language',
    search:'Search products...', newsletter:'Subscribe to our newsletter', subscribe:'Subscribe',
    trust_organic:'100% Organic', trust_shipping:'Fast Shipping', trust_support:'24/7 Support', trust_returns:'Free Returns',
    next:'Next', back:'Back', close:'Close',
  },
  fr: {
    brand:'GreenCart', tagline:'Votre boutique naturiste de confiance',
    nav_home:'Accueil', nav_products:'Produits', nav_cart:'Panier', nav_track:'Suivi',
    hero_title:'Bien-être Naturel,\nLivré à Votre Porte', hero_sub:'Produits biologiques et naturels de qualité supérieure, sélectionnés pour votre santé.',
    hero_cta:'Explorer les Produits', hero_cta2:'Voir les Offres',
    featured:'Produits Vedettes', view_all:'Voir Tout',
    categories:'Catégories', cat_all:'Tous', cat_superfoods:'Superaliments', cat_supplements:'Suppléments', cat_teas:'Thés', cat_oils:'Huiles', cat_grains:'Céréales', cat_care:'Soins Personnels',
    add_cart:'Ajouter au Panier', buy_now:'Acheter', added:'Ajouté!',
    cart_title:'Votre Panier', cart_empty:'Votre panier est vide', cart_subtotal:'Sous-total', cart_total:'Total', cart_checkout:'Passer la Commande', cart_continue:'Continuer les Achats', cart_remove:'Supprimer',
    checkout_title:'Commande', step_shipping:'Livraison', step_payment:'Paiement', step_confirm:'Confirmer',
    field_name:'Nom complet', field_email:'E-mail', field_address:'Adresse', field_city:'Ville', field_phone:'Téléphone',
    pay_method:'Mode de Paiement', pay_process:'Traiter le Paiement', pay_processing:'Traitement...', pay_success:'Paiement réussi!', pay_error:'Erreur de paiement',
    order_confirm:'Confirmer la Commande', order_place:'Passer la Commande',
    track_title:'Suivi de Commande', track_id:'ID de Commande', track_search:'Chercher', track_no:'Entrez votre ID de commande',
    status_created:'Commande Créée', status_processing:'En Cours', status_preparing:'Préparation', status_shipped:'Expédiée', status_transit:'En Transit', status_delivered:'Livrée', status_returned:'Retournée',
    reviews_label:'avis', stock_low:'Dernières unités!', stock_out:'Rupture de Stock',
    badge_bestseller:'Best-seller', badge_new:'Nouveau', badge_premium:'Premium',
    footer_rights:'Tous droits réservés', footer_about:'À Propos', footer_contact:'Contact', footer_privacy:'Confidentialité',
    social_proof:'personnes ont acheté ceci aujourd\'hui', loading:'Chargement...', qty:'Quantité',
    saga_rollback:'Paiement échoué. Annulation...', saga_stock:'Restauration du stock...', saga_complete:'Annulation terminée.',
    country_label:'Pays', currency_label:'Devise', lang_label:'Langue',
    search:'Rechercher des produits...', newsletter:'Abonnez-vous à notre newsletter', subscribe:'S\'abonner',
    trust_organic:'100% Bio', trust_shipping:'Livraison Rapide', trust_support:'Support 24/7', trust_returns:'Retours Gratuits',
    next:'Suivant', back:'Retour', close:'Fermer',
  },
  de: {
    brand:'GreenCart', tagline:'Ihr vertrauenswürdiger Naturladen',
    nav_home:'Startseite', nav_products:'Produkte', nav_cart:'Warenkorb', nav_track:'Verfolgung',
    hero_title:'Natürliches Wohlbefinden,\nAn Ihre Tür Geliefert', hero_sub:'Premium Bio- und Naturprodukte, ausgewählt für Ihre Gesundheit.',
    hero_cta:'Produkte Entdecken', hero_cta2:'Angebote Ansehen',
    featured:'Ausgewählte Produkte', view_all:'Alle Anzeigen',
    categories:'Kategorien', cat_all:'Alle', cat_superfoods:'Superfoods', cat_supplements:'Nahrungsergänzung', cat_teas:'Tees', cat_oils:'Öle', cat_grains:'Getreide', cat_care:'Körperpflege',
    add_cart:'In den Warenkorb', buy_now:'Jetzt Kaufen', added:'Hinzugefügt!',
    cart_title:'Ihr Warenkorb', cart_empty:'Ihr Warenkorb ist leer', cart_subtotal:'Zwischensumme', cart_total:'Gesamt', cart_checkout:'Zur Kasse', cart_continue:'Weiter Einkaufen', cart_remove:'Entfernen',
    checkout_title:'Kasse', step_shipping:'Versand', step_payment:'Zahlung', step_confirm:'Bestätigen',
    field_name:'Vollständiger Name', field_email:'E-Mail', field_address:'Adresse', field_city:'Stadt', field_phone:'Telefon',
    pay_method:'Zahlungsmethode', pay_process:'Zahlung Verarbeiten', pay_processing:'Verarbeitung...', pay_success:'Zahlung erfolgreich!', pay_error:'Zahlungsfehler',
    order_confirm:'Bestellung Bestätigen', order_place:'Bestellung Aufgeben',
    track_title:'Bestellverfolgung', track_id:'Bestell-ID', track_search:'Suchen', track_no:'Geben Sie Ihre Bestell-ID ein',
    status_created:'Bestellt', status_processing:'In Bearbeitung', status_preparing:'Vorbereitung', status_shipped:'Versandt', status_transit:'Unterwegs', status_delivered:'Zugestellt', status_returned:'Zurückgesandt',
    reviews_label:'Bewertungen', stock_low:'Letzte Einheiten!', stock_out:'Ausverkauft',
    badge_bestseller:'Bestseller', badge_new:'Neu', badge_premium:'Premium',
    footer_rights:'Alle Rechte vorbehalten', footer_about:'Über Uns', footer_contact:'Kontakt', footer_privacy:'Datenschutz',
    social_proof:'Personen haben dies heute gekauft', loading:'Laden...', qty:'Menge',
    saga_rollback:'Zahlung fehlgeschlagen. Rückgängig...', saga_stock:'Bestand wiederherstellen...', saga_complete:'Rückgängig abgeschlossen.',
    country_label:'Land', currency_label:'Währung', lang_label:'Sprache',
    search:'Produkte suchen...', newsletter:'Abonnieren Sie unseren Newsletter', subscribe:'Abonnieren',
    trust_organic:'100% Bio', trust_shipping:'Schneller Versand', trust_support:'24/7 Support', trust_returns:'Kostenlose Rücksendung',
    next:'Weiter', back:'Zurück', close:'Schließen',
  }
};

export const paymentIcons = {
  PSE:'🏦', Nequi:'📱', PIX:'⚡', card:'💳', paypal:'🅿️', sepa:'🏛️'
};

export const paymentNames = {
  PSE:'PSE - Pagos Seguros en Línea', Nequi:'Nequi', PIX:'PIX - Pagamento Instantâneo',
  card:'Credit / Debit Card', paypal:'PayPal', sepa:'SEPA Direct Debit'
};
