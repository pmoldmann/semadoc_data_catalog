# Model Documentation Help

This page shows the automatically generated documentation for a Power BI Semantic Model. The documentation is divided into seven sections, accessible via the tabs above.

---

## Model

The starting point of the documentation. Here you find metadata (workspace, last update), an AI-generated summary of the model's business purpose, and key metrics: number of tables, columns, measures, and relationships. A Mermaid diagram visualizes the data model architecture with its fact and dimension tables. The overview is supplemented by data quality notes, such as missing descriptions or referential integrity violations.

## Tables

Detailed documentation of all tables and columns in the model. An ER diagram shows the relationships between tables, followed by a sorted overview with each table's role, row count, and AI-generated description. The detail view for each table lists all columns with data type, cardinality, and description, along with a color-coded relationship diagram. Summary statistics show the distribution of data types and data sources used.

## Measures

Overview and detail view of all DAX measures in the model. The summary table lists each measure with its home table, display folder, and an AI-generated explanation of its calculation logic. The detail view shows the full DAX code, dynamic format string expressions, and a dependency diagram illustrating which tables a measure references.

## Import Logic

Analysis of the Power Query (M) import logic for all tables. An AI-generated review identifies potential issues such as hardcoded file paths or missing parameterization. The overview shows the number of steps and a cost estimate per table, making it easy to spot performance bottlenecks. Color-coded flowcharts visualize the individual import steps and their dependencies.

## Calculation Items

Documentation of all calculation groups and their items. Here you find an overview of the calculation groups with their precedence order, number of items, and a description of how they interact. Each calculation item is documented with its full DAX code — typical use cases include time intelligence (YoY, MoM) or statistical calculations.

## UDFs

Documentation of User Defined Functions — reusable DAX functions in the model. Each UDF is classified as model-dependent or model-independent, indicating whether it can be reused in other models. You will find the full DAX code, an AI-generated explanation of the function logic, and a list of all measures that use the respective UDF.

## Security

Documentation of the Semantic Model's Row-Level Security (RLS). Here you find an overview of all defined security roles, their members, and the DAX filter expressions that restrict data access per role. For each role, the documentation shows which tables the access restriction applies to and which filter expression is used. This tab is only displayed if the model defines RLS roles.
