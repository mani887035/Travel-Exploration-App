const DEST_IMAGES = {
  "Jaipur": [
    "img/jaipur.png",
    "img/jaipur.png",
    "https://upload.wikimedia.org/wikipedia/commons/e/e5/1_Maharaja_Sawai_Jai_Singh_II_ca_1725_Jaipur._British_museum.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/18/Albert_Hall_%28_Jaipur_%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/13/Amber_palace%2C_Jaipur.jpg"
  ],
  "Jaisalmer": [
    "img/jaisalmer.png",
    "img/jaisalmer.png",
    "https://upload.wikimedia.org/wikipedia/commons/7/70/A_jumping_camel.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/19/Asia_800ad.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/97/Bada_bhagh%2C_jaialmer.jpg"
  ],
  "Udaipur": [
    "img/udaipur.png",
    "img/udaipur.png",
    "https://upload.wikimedia.org/wikipedia/commons/5/5c/20191207_City_Palace%2C_Udaipur_1701_7325.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/54/A_dusk_view_of_Lake_Palace_Udaipur_Rajasthan_India.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/57/A_view_of_Udaipur_Rajasthan_India_March_2015_d.jpg"
  ],
  "Jodhpur": [
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/1996_-218-20A_Jodhpur_Hotel_Umaid_Bhawan_Palace_%282233393509%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fe/ClockTower%2Cjodhpur_%28enhanced%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/IIT_Jodhpur.jpg"
  ],
  "Ranthambore": [
    "img/ranthambore.png",
    "img/ranthambore.png"
  ],
  "Munnar": [
    "img/munnar.png",
    "img/munnar.png",
    "https://upload.wikimedia.org/wikipedia/commons/a/af/Mattupetty_Lake_View.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/09/Munnar_-_Tea_Plantations.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Munnar_25-10-10_13-52-43-764.jpg"
  ],
  "Alleppey": [
    "img/alleppey.png",
    "img/alleppey.png"
  ],
  "Wayanad": [
    "https://images.unsplash.com/photo-1593693397690-362bb9a11866?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?q=80&w=1200&auto=format&fit=crop"
  ],
  "Kovalam": [
    "https://upload.wikimedia.org/wikipedia/commons/0/0e/01KovalamBeach%26Kerala.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/0a/FishingBoat-KovalamBeach-Kerala-India-May2002.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/Kovalam_-_view_from_the_lighthouse.jpg"
  ],
  "Thekkady": [
    "https://upload.wikimedia.org/wikipedia/commons/1/12/Bamboo_Rafting_during_guided_tour_through_Periyar_Wild_Life_Sanctury.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/6/69/Boat_similar_to_the_one_involved.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/8/8e/Cardamom_Hills.jpg"
  ],
  "Manali": [
    "img/manali.png",
    "img/manali.png"
  ],
  "Shimla": [
    "img/shimla.png",
    "img/shimla.png",
    "https://upload.wikimedia.org/wikipedia/commons/c/ca/A_folk_procession_in_Shimla.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/Annadale_Ground_Shimla_side_view.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/85/Annandale_Shimla3.jpg"
  ],
  "Spiti Valley": [
    "img/spitivalley.png",
    "img/spitivalley.png"
  ],
  "Dharamshala": [
    "https://upload.wikimedia.org/wikipedia/commons/0/04/20170821_133215000_iOS.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/20170821_133842000_iOS.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/78/Bhagsu_nag_temple.jpg"
  ],
  "North Goa": [
    "img/northgoa.png",
    "img/northgoa.png"
  ],
  "South Goa": [
    "img/southgoa.png",
    "img/southgoa.png"
  ],
  "Dudhsagar Falls": [
    "https://upload.wikimedia.org/wikipedia/commons/0/0f/Castle_rock_railway_station%2C_Karnataka.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/0b/Doodhsagar_Fall.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f7/Doodhsagar_Waterfalls.jpg"
  ],
  "Rishikesh": [
    "img/rishikesh.png",
    "img/rishikesh.png",
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/13_Manzil_Temple_Rishikesh_2021.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/09/Aarti_at_Triveni_Ghat_Rishikesh.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/90/Adventures_camping_in_rishikesh.jpg"
  ],
  "Nainital": [
    "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1627993077651-6ca356b57116?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588629578135-d225dcac1048?q=80&w=1200&auto=format&fit=crop"
  ],
  "Valley of Flowers": [
    "https://upload.wikimedia.org/wikipedia/commons/d/dc/%22Flowers_Blossom_At_valley_of_flowers_Chamoli%2C_India%22_38.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/%22Flowers_Blossom_At_valley_of_flowers_Chamoli%2C_India%22_40.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/86/%22Flowers_Blossom_at_Valley_of_Flowers_Chamoli%2C_India%22_52.jpg"
  ],
  "Madurai": [
    "https://upload.wikimedia.org/wikipedia/commons/6/66/0_Madurai_Teppakulam_illuminated.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/11/A_sunrise_over_Vaigai_River_in_Madurai_Tamil_Nadu_India.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/8b/Avaniyapuram_Jallikattu_04.jpg"
  ],
  "Ooty": [
    "https://upload.wikimedia.org/wikipedia/commons/5/56/Botanical_garden_ooty.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/3/30/Government_Botanical_Garden_Ooty_India.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a4/NMR_Train_on_viaduct_05-02-26_33.jpeg"
  ],
  "Mahabalipuram": [
    "img/mahabalipuram.png",
    "img/mahabalipuram.png"
  ],
  "Darjeeling": [
    "https://upload.wikimedia.org/wikipedia/commons/2/29/1046_IndiaDarjeeling_19931231_%282%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ailurus_fulgens.ogv",
    "https://upload.wikimedia.org/wikipedia/commons/7/75/Art_of_W._Taylor_in_1854%2C_Himalayan_Journals%3B_or%2C_Notes_of_a_Naturalist_in_Bengal%2C_the_Sikkim_and_Nepal_Himalayas%2C_the_Khasia_Mountains%2C_%26c._Volume_1_by_J._D._Hooker%2C_Kanchanjunga_from_Hodgson%27s_bungalow_%28cropped%29.jpg"
  ],
  "Mumbai": [
    "img/mumbai.png",
    "img/mumbai.png",
    "https://upload.wikimedia.org/wikipedia/commons/b/bb/1st_INC1885.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/AMH-6748-NA_Two_views_of_the_English_fort_in_Bombay.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/ae/Bandra_Worli_Sea-Link_%28cropped%29.jpg"
  ],
  "Lonavala": [
    "https://upload.wikimedia.org/wikipedia/commons/a/a8/...sanctum_sanctorum....._%2824519395033%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fb/A_waterfall_on_the_way_to_Lonavala%2C_Maharashtra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/09/Bhaja_Caves_1.jpg"
  ],
  "Coorg": [
    "img/coorg.png",
    "img/coorg.png"
  ],
  "Hampi": [
    "img/hampi.png",
    "img/hampi.png",
    "https://upload.wikimedia.org/wikipedia/commons/7/77/15th-16th_century_ruins_of_market_and_Vaishnavism_Achyutaraya_Tiruvengalanatha_temple%2C_Hampi_Hindu_monuments_Karnataka_3.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/45/15th-16th_century_ruins_of_market_and_Vaishnavism_Vitthala_temple%2C_Hampi_Hindu_monuments_Karnataka.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3d/15th_century_aqua_duct_to_Mahanavami_platform_Pushkarani_step_well%2C_Hampi_Hindu_monuments_Karnataka_3.jpg"
  ],
  "Srinagar": [
    "https://upload.wikimedia.org/wikipedia/commons/9/97/A_DEMU_passenger_train_at_Srinagar_Railway_Station_Platform.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e0/A_view_of_Pari_Mahal_Jammu_and_Kashmir_India.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6d/Ancient_Temple-Hari_Parbat-2.JPG"
  ],
  "Rann of Kutch": [
    "https://upload.wikimedia.org/wikipedia/commons/d/d2/Dholavira_East_Gate.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/9e/Greater_Flamingos_at_Rann_of_Kutch.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/53/Nilgai_group_at_Little_Rann_of_kutch.JPG"
  ],
  "Vellore": [
    "img/vellore.jpg",
    "img/vellore-1.jpg",
    "img/vellore-2.jpg",
    "img/vellore-3.jpg",
    "img/vellore_real_new_1.jpg"
  ],
  "Kodaikanal": [
    "img/kodaikanal_real_1.jpg",
    "img/kodaikanal_real_1.jpg",
    "img/kodaikanal_real_1.jpg"
  ],
  "Kanniyakumari": [
    "img/kanniyakumari_real_1.jpg",
    "img/kanniyakumari_real_2.jpg",
    "img/kanniyakumari_real_1.jpg"
  ],
  "Rameshwaram": [
    "img/rameshwaram_real_1.jpg",
    "img/rameshwaram_real_2.jpg",
    "img/rameshwaram_real_1.jpg"
  ],
  "Hogenakkal": [
    "img/hogenakkal_real_1.jpg",
    "img/hogenakkal_real_2.jpg",
    "img/hogenakkal_real_1.jpg"
  ],
  "Yelagiri": [
    "img/placeholder.jpg",
    "img/placeholder.jpg",
    "img/placeholder.jpg"
  ],
  "Yercaud": [
    "img/yercaud_real_1.jpg",
    "img/yercaud_real_2.jpg",
    "img/yercaud_real_1.jpg"
  ]
};
