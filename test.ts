const dataset= [
            {
                _id: "1",
                vintage: "Pigy boy",
                name: "Stefan",
                producerId: "1",
                producer: {
                    _id: "12",
                    name: "Bodorkos",
                    country: "Hungay",
                    region: "Villany",
                }
            },        
            {
                _id: "Puch",
                vintage: "Pigy boy",
                name: "Stefan",
                producerId: "1",
                producer: {
                    _id: "12",
                    name: "Bodorkos",
                    country: "Hungay",
                    region: "Villany",
                }
            },
            {
                _id: "Yamaha",
                vintage: "Bobber",
                name: "Scretcher",
                producerId: "2",  
                producer: {
                    _id: "13",
                    name: "Puli",
                    country: "Hungay",
                    region: "Szekszard",
                }                      
            },
            {
                _id: "Honda",
                vintage: "Caffee racer",
                name: "BobbyRiderT",
                producerId: "2",   
                producer: {
                    _id: "13",
                    name: "Puli",
                    country: "Hungay",
                    region: "Szekszard",
                }                       
            }            
        ]

function  product(id: string) {
        const result = dataset.filter((product: any) => product._id === id)[0]
        console.log(result)
}     

product('Honda')