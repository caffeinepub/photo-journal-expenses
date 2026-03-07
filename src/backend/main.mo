import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Entry = {
    id : Text;
    date : Int;
    note : Text;
    photo : Storage.ExternalBlob;
  };

  let entries = Map.empty<Text, Entry>();

  public shared ({ caller }) func addEntry(id : Text, date : Int, note : Text, photo : Storage.ExternalBlob) : async () {
    if (entries.containsKey(id)) { Runtime.trap("Entry already exists.") };
    let entry : Entry = {
      id;
      date;
      note;
      photo;
    };
    entries.add(id, entry);
  };

  public shared ({ caller }) func deleteEntry(id : Text) : async () {
    if (not entries.containsKey(id)) { Runtime.trap("Entry does not exist.") };
    entries.remove(id);
  };

  public query ({ caller }) func getEntry(id : Text) : async Entry {
    switch (entries.get(id)) {
      case (null) { Runtime.trap("Entry does not exist.") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func listEntries() : async [Entry] {
    entries.values().toArray();
  };
};
