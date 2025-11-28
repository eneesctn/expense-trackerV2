expenses = []

def show_menu():
    print("harcama takip uygulamasi")
    print("1 ) Harcama ekle")
    print("2) harcamalari goster")
    print("3) toplami goster")
    print("4 ) cik")

while True:
    show_menu()
    choice = input("secimin:  ")

    if choice == "1":
        print(">> Harcama ekleme secildi")
        description = input("aciklama:")
        amount_text = input("tutar($): ")
        try:
            amount = float(amount_text)
        except ValueError:
            print("hatali tutar girdin, islem iptal edildi.")
            continue
        category = input("kategori (ornek: yemek , ulasim, market):")
        expense = {
            "description": description,
            "amount": amount,
            "category": category
        }
        expenses.append(expense)
        print("harcama kaydedildi!")
    elif choice == "2":
        print("\n --- harcamalar---")
        if len(expenses)== 0:
            print("henuz hic harcama yok.")
        else:
            for i, exp in enumerate(expenses,start=1):
                print(f"{i}) {exp['description']} - {exp['amount']} $ - ({exp['category']}")
        
    elif choice == "3":
        print("\n ---toplam harcama---")
        toplam = sum(exp['amount']for exp in expenses)
        print(f"toplam: {toplam}$")
    elif choice == "4":
        print("cikis yapma secildi")
        break
    else:
        print("gecersiz bir tuslama yaptiniz tekrar deneyin")
