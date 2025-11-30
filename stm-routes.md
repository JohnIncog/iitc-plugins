![telegram-cloud-photo-size-1-4999464751888796533-w](https://github.com/user-attachments/assets/214f2ecd-4218-49a9-a280-7de6ed0d9628)

How To Generate stm_routes.geojson

```
wget https://www.stm.info/sites/default/files/gtfs/stm_sig.zip
unzip stm_sig.zip
ogr2ogr -t_srs EPSG:4326 stm_routes.geojson stm_lignes_sig.shp
mv stm_routes.geojson docs
```

