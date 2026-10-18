import 'dart:convert';

enum CategoryType { expense, income }

class Category {
  final String id;
  final String name;
  final String icon;
  final String colorHex;
  final CategoryType type;
  final List<String> subCategories;

  Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.colorHex,
    required this.type,
    required this.subCategories,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color_hex': colorHex,
      'type': type.name,
      'sub_categories_json': jsonEncode(subCategories),
    };
  }

  factory Category.fromMap(Map<String, dynamic> map) {
    List<String> subs = [];
    if (map['sub_categories_json'] != null) {
      final decoded = jsonDecode(map['sub_categories_json'] as String);
      if (decoded is List) {
        subs = decoded.map((e) => e.toString()).toList();
      }
    }

    return Category(
      id: map['id'] as String,
      name: map['name'] as String,
      icon: map['icon'] as String,
      colorHex: map['color_hex'] as String,
      type: CategoryType.values.byName(map['type'] as String),
      subCategories: subs,
    );
  }
}
