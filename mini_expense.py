total = 0  # toplam harcama

while True:
    print("\nMini Harcama Uygulaması")
    print("1) Harcama ekle")
    print("2) Toplamı göster")
    print("3) Çık")

    choice = input("Seçimin: ")

    if choice == "1":
        amount_text = input("Tutar (₺): ")
        amount = float(amount_text)
        total = total + amount
        print("Harcama eklendi!")
    
    elif choice == "2":
        print(f"Toplam harcama: {total}₺")
    
    elif choice == "3":
        print(">> Çıkış yapılıyor...")
        break
    
    else:
        print("Geçersiz seçim, tekrar dene.")
