# json-deserializer
The json deserializer I'm using for angular.

##How to

###`deserializeAbel`

Use this decorator to tell json-deserializer that this class is deserialisable.

_In the background this adds a new `_deserialize` function to the class_

```typescript
@deserializeAbel
class Address {
   ...
}
```

###`deserialize`

Use this decorator factory to tell json-deserializer how it should deserialize this property.

Use can pass some metadata to it:

```typescript
interface DeserializeMetaData {
    deserialize: boolean,
    type?: any,
    arrayType?: any
}

@deserialize({ deserialize: true, arrayType: Address })
```

`DeserializeMetaData.deserialize` set this to false to skip this property. Default: `true`.

`DeserializeMetaData.type` the type of the property. Usually you are not interested in that.

`DeserializeMetaData.arrayType` if the property is a array you may set this to the type of the array.

###`Deserialisation`

Class that does the work for you.

```typescript
Deserialisation.d<User>(User, jsonResponse);
```

Pass in the Type you want to deserialize and the json data to use. Thats all.

---

##Example Usage:

```typescript
import { Deserialisation, deserializeAbel, deserialize } from './deserialize';

@deserializeAbel
class User {
    @deserialize()
    id: number;

    @deserialize()
    username: string;

    @deserialize({ deserialize: true, arrayType: Address })
    addresses: Address[];

    // Won't get deserialized
    @deserialize({ deserialize: false })
    customProperty: any;
}

@deserializeAbel
class Address {
    @deserialize()
    city: string;

    @deserialize()
    street: string;

    @deserialize()
    number: number;
}

let jsonResponse = {
    id: 234723894,
    username: "_josh_",
    addresses: [{
        city: "L.A.",
        street: "some street",
        number: 115
    }, {
        city: "N.Y.",
        street: "some other street",
        number: 268
    }
    ]
}

let user = Deserialisation.d<User>(User, jsonResponse);
console.log("Got him: %o", user);
console.log(user instanceof User); // true
```
